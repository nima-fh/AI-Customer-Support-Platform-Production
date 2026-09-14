import os
from pathlib import Path
from dotenv import load_dotenv

BACKEND_ROOT = Path(__file__).resolve().parents[2]
ENV_FILE = BACKEND_ROOT / ".env"

load_dotenv(ENV_FILE)


JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

DATABASE_URL = os.getenv("DATABASE_URL")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

LLM_MODEL = os.getenv(
    "LLM_MODEL",
    "google/gemma-4-31b-it:free",
)

if not JWT_SECRET_KEY:
    raise ValueError("JWT_SECRET_KEY is not configured.")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not configured.")
