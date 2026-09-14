from app.db.database import SessionLocal
from app.db.models import KnowledgeDocument
from app.ai.embeddings import embed_text


documents = [
    """
    Refund policy:
    Customers can request a refund within 30 days of purchase.
    Refunds are processed within 5 business days.
    """,
    """
    Shipping policy:
    Orders are shipped within 2 business days.
    Delivery usually takes 3-7 business days.
    """,
    """
    Support policy:
    If the AI assistant cannot solve the problem,
    the conversation will be transferred to a human support agent.
    """,
]


def ingest():
    db = SessionLocal()

    try:
        for doc in documents:
            embedding = embed_text(doc, task="RETRIEVAL_DOCUMENT")

            item = KnowledgeDocument(content=doc, embedding=embedding)

            db.add(item)

        db.commit()

        print("Documents inserted successfully")

    finally:
        db.close()


if __name__ == "__main__":
    ingest()
