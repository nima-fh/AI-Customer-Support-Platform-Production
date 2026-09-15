from functools import lru_cache

import os

from langchain_openai import ChatOpenAI

from app.core.config import LLM_MODEL


@lru_cache
def get_llm():
    api_key = os.getenv("OPENROUTER_API_KEY")

    if not api_key:
        raise ValueError("OPENROUTER_API_KEY is not configured.")

    return ChatOpenAI(
        model="nvidia/nemotron-3.5-lightning:free",
        max_tokens=500,
        temperature=0.2,
        api_key=api_key,
        base_url="https://openrouter.ai/api/v1",
    )
