from pathlib import Path

from langchain_core.tools import tool
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS


VECTORSTORE_DIR = Path(__file__).resolve().parents[4] / "data" / "vectorstore"

embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-small-en-v1.5")

vectorstore = FAISS.load_local(
    str(VECTORSTORE_DIR),
    embeddings,
    allow_dangerous_deserialization=True,
)


@tool
def search_knowledge(query: str):
    """
    Search the company knowledge base for company policies,
    refunds, shipping, warranty, products, and FAQs.

    Returns only relevant information from the company knowledge base.
    """

    results = vectorstore.similarity_search_with_score(query, k=3)

    relevant_results = [
        (document, score) for document, score in results if score <= 0.8
    ]

    if not relevant_results:
        return "No relevant information was found in the knowledge base."

    formatted_results = []

    for document, score in relevant_results:
        source = document.metadata.get("source", "Unknown source")

        page = document.metadata.get("page")

        source_info = source

        if page is not None:
            source_info += f", page {page + 1}"

        formatted_results.append(
            f"SOURCE: {source_info}\nCONTENT:\n{document.page_content}"
        )

    return "\n\n---\n\n".join(formatted_results)
