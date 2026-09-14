from langchain_core.tools import tool
from sqlalchemy.orm import Session

from ...services.customer_service import get_customer


def create_get_customer_tool(db: Session, customer_id: int):

    @tool
    def get_customer_tool():
        """
        Get information about the authenticated current customer.

        IMPORTANT:
        This tool can ONLY return information about the current authenticated
        customer. It cannot retrieve another customer's information.
        """
        customer = get_customer(customer_id, db)

        if customer is None:
            return "Customer information not found."

        return {
            "customer_id": customer.id,
            "name": customer.name,
            "email": customer.email,
        }

    return [get_customer_tool]
