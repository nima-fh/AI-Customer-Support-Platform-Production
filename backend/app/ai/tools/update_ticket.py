from langchain_core.tools import tool
from sqlalchemy.orm import Session

from ...schemas.ticket import TicketUpdate, TicketStatus, TicketPriority
from ...services.ticket_service import update_ticket


def create_update_ticket_tool(db: Session, customer_id: int):

    @tool
    def update_support_ticket(
        ticket_id: int,
        status: str | None = None,
        priority: str | None = None,
        category: str | None = None,
    ) -> str:
        """
        Update an existing support ticket belonging to the authenticated customer.

        Use this when the customer explicitly asks to change, update, close,
        reopen, or change the priority/category of their support ticket.

        Never ask for or use customer_id. The authenticated customer's ID
        is provided by the application.
        """

        try:
            update_data = {}

            if status is not None:
                update_data["status"] = TicketStatus(status)

            if priority is not None:
                update_data["priority"] = TicketPriority(priority)

            if category is not None:
                update_data["category"] = category

            if not update_data:
                return "No ticket changes were provided."

            ticket_data = TicketUpdate(**update_data)

            ticket = update_ticket(
                ticket_id=ticket_id,
                ticket_data=ticket_data,
                db=db,
                customer_id=customer_id,
            )

            if ticket is None:
                return f"Ticket #{ticket_id} was not found."

            return (
                f"Support ticket #{ticket.id} was updated successfully. "
                f"Status: {ticket.status}. "
                f"Priority: {ticket.priority}. "
                f"Category: {ticket.category}."
            )

        except ValueError:
            return (
                "Invalid ticket update. "
                "Status must be open, pending, or closed, "
                "and priority must be low, normal, or high."
            )

        except Exception as e:
            db.rollback()
            print(f"UPDATE TICKET ERROR: {repr(e)}")
            return "Unable to update the support ticket."

    return [update_support_ticket]
