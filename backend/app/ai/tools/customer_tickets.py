from langchain_core.tools import tool
from sqlalchemy.orm import Session

from ...db.models import Ticket


def create_get_customer_tickets_tool(db: Session, customer_id: int):

    @tool
    def get_customer_tickets():
        """
        Get all support tickets belonging to the authenticated current customer.

        IMPORTANT:
        This tool NEVER accepts or uses a customer ID from the user.
        It can ONLY return tickets belonging to the current authenticated customer.
        """
        tickets = db.query(Ticket).filter(Ticket.customer_id == customer_id).all()

        if not tickets:
            return f"No tickets found for customer {customer_id}."

        return [
            {
                "ticket_id": ticket.id,
                "subject": ticket.subject,
                "status": ticket.status,
                "priority": ticket.priority,
            }
            for ticket in tickets
        ]

    return [get_customer_tickets]
