from sqlalchemy import text
from sqlalchemy.orm import Session

from app.ai.embeddings import embed_text


def search_knowledge_documents(
    db: Session,
    query: str,
    match_count: int = 5,
    threshold: float = 0.25,
) -> list[dict]:
    query_embedding = embed_text(query)
    embedding_string = "[" + ",".join(map(str, query_embedding)) + "]"

    sql = text(
        """
        SELECT *
        FROM match_knowledge_documents(
            CAST(:query_embedding AS extensions.vector(384)),
            :match_count
        )
        """
    )

    result = db.execute(
        sql,
        {
            "query_embedding": embedding_string,
            "match_count": match_count,
        },
    )

    documents = [
        {
            "id": row.id,
            "content": row.content,
            "metadata": row.metadata,
            "similarity": row.similarity,
        }
        for row in result
        if row.similarity >= threshold
    ]

    return documents
