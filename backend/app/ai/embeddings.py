from functools import lru_cache

from fastembed import TextEmbedding


@lru_cache
def get_embedding_model():
    return TextEmbedding(
        model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
    )


def embed_text(text: str) -> list[float]:
    model = get_embedding_model()

    embedding = next(model.embed([text]))

    return embedding.tolist()


def embed_documents(texts: list[str]) -> list[list[float]]:
    model = get_embedding_model()

    embeddings = model.embed(texts)

    return [embedding.tolist() for embedding in embeddings]
