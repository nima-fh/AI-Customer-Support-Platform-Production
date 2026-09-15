from sqlalchemy.orm import Session
from .llm import get_llm
from langchain_core.messages import HumanMessage, AIMessage
from .prompts.support import SYSTEM_PROMPT
from .tools.orders import create_get_order_tool
from langchain.agents import create_agent
from .tools.tickets import create_get_ticket_tool
from .tools.customers import create_get_customer_tool
from .tools.customer_orders import create_get_customer_orders_tool
from .tools.customer_tickets import create_get_customer_tickets_tool
from .tools.knowledge import create_search_knowledge_tool
from .tools.create_ticket import create_create_ticket_tool
from .tools.update_ticket import create_update_ticket_tool


def build_messages(message: str, history: list):
    messages = []

    for msg in history:
        if msg.role == "user":
            messages.append(HumanMessage(content=msg.content))

        elif msg.role == "assistant":
            messages.append(AIMessage(content=msg.content))

    messages.append(HumanMessage(content=message))

    return messages


def generate_response(
    message: str, history: list, db: Session, customer_id: int, conversation_id: int
):

    messages = build_messages(message, history)

    order_tools = create_get_order_tool(db, customer_id)
    ticket_tools = create_get_ticket_tool(db, customer_id)
    customer_tools = create_get_customer_tool(db, customer_id)
    customer_order_tools = create_get_customer_orders_tool(db, customer_id)
    customer_tickets_tool = create_get_customer_tickets_tool(db, customer_id)
    search_knowledge_tool = [create_search_knowledge_tool(db)]
    create_ticket_tool = create_create_ticket_tool(db, customer_id, conversation_id)
    update_ticket_tool = create_update_ticket_tool(db, customer_id)

    tools = (
        order_tools
        + ticket_tools
        + customer_tools
        + customer_order_tools
        + customer_tickets_tool
        + search_knowledge_tool
        + create_ticket_tool
        + update_ticket_tool
    )

    llm = get_llm()

    agent = create_agent(model=llm, tools=tools, system_prompt=SYSTEM_PROMPT)

    result = agent.invoke({"messages": messages})

    return result["messages"][-1].content
