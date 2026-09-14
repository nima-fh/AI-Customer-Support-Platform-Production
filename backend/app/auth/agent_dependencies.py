from fastapi import Depends, HTTPException, status

from app.auth.dependencies import get_current_user
from app.db.models import User


def get_current_agent(current_user: User = Depends(get_current_user)):
    if current_user.role != "support_agent":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Support agent access required",
        )

    return current_user
