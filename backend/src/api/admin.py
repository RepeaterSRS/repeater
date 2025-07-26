from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.auth.jwt import get_current_user
from src.db import get_db
from src.db.models import User, UserRole
from src.pagination import PaginationService, get_pagination_params
from src.schemas.pagination import PaginatedResponse, PaginationParams
from src.schemas.user import UserOut

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=PaginatedResponse[UserOut])
def get_users(
    show_guests: bool = False,
    pagination: PaginationParams = Depends(get_pagination_params),
    user: User = Depends(get_current_user),
    db_session: Session = Depends(get_db),
):
    pagination_service = PaginationService(db_session)

    if not user.is_admin:
        raise HTTPException(status_code=403)

    query = db_session.query(User).order_by(User.created_at.desc(), User.id)

    if not show_guests:
        query = query.filter(User.role != UserRole.GUEST)

    return pagination_service.paginate(
        query=query,
        page=pagination.page,
        size=pagination.size,
    )
