from sqlalchemy.orm import Session
from langchain_core.tools import tool

from ...schemas.ticket import TicketCreate
from ...services.ticket_service import create_ticket
from ..classifier import classify_ticket


def create_create_ticket_tool(db: Session, customer_id: int, conversation_id: int):
    @tool
    def create_support_ticket(subject: str, message: str) -> str:
        """
        Create a support ticket for the authenticated customer.

        Use this when the customer explicitly asks to create,
        open, or submit a support ticket.

        The system automatically determines the ticket category,
        priority, and whether human escalation is required.
        """

        try:
            # -----------------------------------------
            # AI ticket classification
            # -----------------------------------------
            classification = classify_ticket(message)

            print("\n========== TICKET CLASSIFICATION ==========")
            print(f"category: {classification.category.value}")
            print(f"priority: {classification.priority}")
            print(f"escalation_required: {classification.escalation_required}")

            # -----------------------------------------
            # Create ticket
            # -----------------------------------------
            ticket_data = TicketCreate(
                customer_id=customer_id,
                subject=subject,
                message=message,
                priority=classification.priority,
                category=classification.category.value,
                escalation_required=classification.escalation_required,
            )

            ticket = create_ticket(ticket_data, db, conversation_id=conversation_id)

            if ticket is None:
                return "Unable to create the support ticket."

            if classification.escalation_required:
                from ...services.escalation_service import escalate_ticket

                ticket = escalate_ticket(ticket.id, db, customer_id)

                if ticket is None:
                    return "Ticket was created, but escalation could not be completed."

            print(f"TICKET CREATED: {ticket.id}")

            status = (
                ticket.status.value
                if hasattr(ticket.status, "value")
                else ticket.status
            )

            priority = (
                ticket.priority.value
                if hasattr(ticket.priority, "value")
                else ticket.priority
            )

            if ticket.escalation_required:
                return (
                    f"Support ticket #{ticket.id} was created successfully. "
                    f"Status: {status}. "
                    f"Priority: {priority}. "
                    "The issue has been escalated to human support."
                )

            return (
                f"Support ticket #{ticket.id} was created successfully. "
                f"Status: {status}. "
                f"Priority: {priority}."
            )
        except Exception as e:
            db.rollback()

            print(f"CREATE TICKET ERROR: {repr(e)}")

            return "Unable to create the support ticket."

    return [create_support_ticket]
