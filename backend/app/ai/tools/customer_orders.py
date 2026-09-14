from langchain_core.tools import tool
from sqlalchemy.orm import Session
from ...db.models import Order


def create_get_customer_orders_tool(db: Session, customer_id: int):

    @tool
    def get_customer_orders():
        """
        Get all orders belonging to the authenticated current customer.

        IMPORTANT:
        This tool NEVER accepts or uses a customer ID from the user.
        It can ONLY return orders belonging to the current authenticated customer.
        """

        orders = db.query(Order).filter(Order.customer_id == customer_id).all()

        if not orders:
            return f"No orders found for customer {customer_id}."

        return [
            {
                "order_id": order.id,
                "status": order.status,
                "total_price": float(order.total_price),
            }
            for order in orders
        ]

    return [get_customer_orders]
