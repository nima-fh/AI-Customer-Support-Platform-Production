from langchain_core.tools import tool
from sqlalchemy.orm import Session
from ...services.ticket_service import get_ticket as get_ticket_from_db


def create_get_ticket_tool(db: Session, customer_id: int):
    @tool
    def get_ticket(ticket_id: int):
        """
        Get ticket details by ticket ID.
        """
        ticket = get_ticket_from_db(ticket_id, db, customer_id)
        if ticket is None:
            return f"Ticket with ID {ticket_id} not found."
        return {
            "ticket_id": ticket.id,
            "customer_id": ticket.customer_id,
            "subject": ticket.subject,
            "message": ticket.message,
            "status": ticket.status,
            "priority": ticket.priority,
        }

    return [get_ticket]
