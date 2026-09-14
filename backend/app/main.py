import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import FRONTEND_URL
from .api.routes.chat import router as chat_router
from .api.routes.conversations import router as conversation_router
from .api.routes.customers import router as customer_router
from .api.routes.messages import router as message_router
from .api.routes.orders import router as order_router
from .api.routes.tickets import router as ticket_router
from .api.routes.ws import router as ws_router
from .auth.router import router as auth_router


app = FastAPI()


frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def check_health():
    return {"status": "healthy", "service": "support-ai"}


app.include_router(order_router)
app.include_router(customer_router)
app.include_router(ticket_router)
app.include_router(conversation_router)
app.include_router(message_router)
app.include_router(chat_router)
app.include_router(auth_router)
app.include_router(ws_router)
