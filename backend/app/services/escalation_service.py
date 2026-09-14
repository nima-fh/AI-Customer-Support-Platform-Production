from sqlalchemy.orm import Session

from ..db.models import Ticket


def escalate_ticket(ticket_id: int, db: Session, customer_id: int):
    ticket = (
        db.query(Ticket)
        .filter(Ticket.id == ticket_id, Ticket.customer_id == customer_id)
        .first()
    )

    if ticket is None:
        return None

    ticket.escalation_required = True

    # Keep the ticket open so a human agent can handle it.
    if ticket.status == "closed":
        ticket.status = "open"

    db.commit()
    db.refresh(ticket)

    return ticket
