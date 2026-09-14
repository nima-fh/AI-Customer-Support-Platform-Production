from langchain_core.tools import tool
from sqlalchemy.orm import Session

from ...services.order_service import get_order as get_order_from_db


def create_get_order_tool(db: Session, customer_id: int):

    @tool
    def get_order(order_id: int):
        """
        Get information about an order using its order ID.
        """

        order = get_order_from_db(order_id, db, customer_id)

        if order is None:
            return {"error": "Order not found"}

        return {
            "order_id": order.id,
            "status": order.status,
            "customer_id": order.customer_id,
            "total_price": float(order.total_price),
        }

    return [get_order]
