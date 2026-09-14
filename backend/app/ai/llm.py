import os

from langchain_ollama import ChatOllama
from langchain_openai import ChatOpenAI

from app.core.config import LLM_PROVIDER, LLM_MODEL


def create_llm():
    if LLM_PROVIDER == "ollama":
        return ChatOllama(
            model=LLM_MODEL,
            temperature=0.2,
        )

    if LLM_PROVIDER == "openrouter":
        api_key = os.getenv("OPENROUTER_API_KEY")

        if not api_key:
            raise ValueError("OPENROUTER_API_KEY is not configured.")

        return ChatOpenAI(
            model=LLM_MODEL,
            temperature=0.2,
            api_key=api_key,
            base_url="https://openrouter.ai/api/v1",
        )

    raise ValueError(f"Unsupported LLM_PROVIDER: {LLM_PROVIDER}")


llm = create_llm()
