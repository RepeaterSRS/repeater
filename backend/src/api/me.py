from fastapi import APIRouter, Depends

from src.auth.jwt import get_current_user
from src.db.models import User
from src.schemas.user import UserOut

router = APIRouter(tags=["me"])


@router.get("/me", response_model=UserOut)
async def get_user_info(user: User = Depends(get_current_user)):
    return user
