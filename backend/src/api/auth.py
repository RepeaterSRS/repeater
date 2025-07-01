import logging

import bcrypt
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.auth.jwt import create_access_token
from src.db import get_db
from src.db.models import User, UserRole
from src.schemas.user import UserCreate, UserLogin, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def login(user_req: UserLogin, db_session: Session = Depends(get_db)):
    user = User.filter_by(db_session, email=user_req.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if user.password_hash is None:
        auth_provider = user.auth_provider
        raise HTTPException(
            status_code=403,
            detail=f"This account was created via {auth_provider.title()}. Please use that provider to sign in.",
        )

    pw_bytes = user_req.password.encode("utf-8")
    pw_hashed = user.password_hash.encode("utf-8")
    if not bcrypt.checkpw(pw_bytes, pw_hashed):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = create_access_token(
        {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
        }
    )
    logging.info(f"User {user.email} logged in")
    return {"access_token": access_token}


@router.post("/register", response_model=UserOut, status_code=201)
def register(user_req: UserCreate, db_session: Session = Depends(get_db)):
    if User.filter_by(db_session, email=user_req.email).first():
        raise HTTPException(status_code=400, detail="Email is in use")

    pw_bytes = user_req.password.encode("utf-8")
    pw_hashed = bcrypt.hashpw(pw_bytes, bcrypt.gensalt()).decode("utf-8")
    user = User(email=user_req.email, password_hash=pw_hashed, role=UserRole.USER)
    user.save(db_session)
    logging.info(f"Created user {user.email}")
    return user
