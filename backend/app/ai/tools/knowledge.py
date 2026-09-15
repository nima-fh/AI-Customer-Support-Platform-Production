from langchain_core.tools import tool
from sqlalchemy.orm import Session

from app.ai.rag.retriever import search_knowledge_documents


def create_search_knowledge_tool(db: Session):

    @tool
    def search_knowledge(query: str) -> str:
        """
        Search the company knowledge base for relevant information.

        Use this tool for questions about:
        - company policies
        - refunds
        - shipping
        - support procedures
        - FAQs
        """

        documents = search_knowledge_documents(
            db=db,
            query=query,
        )

        if not documents:
            return "No relevant information found in the knowledge base."

        context = "\n\n".join(
            [f"Document {doc['id']}:\n{doc['content']}" for doc in documents]
        )

        return context

    return search_knowledge
