import bcrypt
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.db import get_db
from src.db.models import User, UserRole
from src.schemas.user import UserCreate, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def login():
    raise HTTPException(status_code=501)


@router.post("/register", response_model=UserOut)
def register(user_req: UserCreate, session: Session = Depends(get_db)):
    # Always hash to prevent timing attack
    bytes = user_req.password.encode("utf-8")
    hashed_pw = bcrypt.hashpw(bytes, bcrypt.gensalt())

    if User.filter_by(session, email=user_req.email):
        raise HTTPException(status_code=400, detail="Email is in use")

    user = User(email=user_req.email, password_hash=hashed_pw, role=UserRole.USER)
    user.save(session)
    logging.info(f"Created user {user.email}")
    return user
