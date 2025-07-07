from datetime import datetime, timedelta, timezone
from os import getenv
from uuid import UUID

import jwt
from fastapi import Cookie, Depends, HTTPException
from sqlalchemy.orm import Session

from src.db import get_db
from src.db.models import User

SECRET_KEY = getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_SECONDS = 60 * 60  # 1 hour
REFRESH_TOKEN_EXPIRE_SECONDS = 60 * 60 * 24 * 10  # 10 days


def get_access_token_cookie_kwargs(access_token: str):
    return dict(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_SECONDS,
    )


def get_refresh_token_cookie_kwargs(refresh_token: str):
    return dict(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_SECONDS,
    )


def create_jwt(user_id: UUID, exp_delta_seconds: int, data: dict = {}) -> str:
    payload = {
        "sub": str(user_id),
    }

    if data is not None:
        payload.update(data)

    now = datetime.now(timezone.utc)
    expire = now + timedelta(seconds=exp_delta_seconds)

    # Ignore token expiration when testing
    if not getenv("IGNORE_JWT_EXPIRATION"):
        payload.update({"iat": now, "exp": expire})

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_jwt(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


def get_current_user(
    access_token: str | None = Cookie(default=None),
    db_session: Session = Depends(get_db),
) -> User:
    if access_token is None:
        raise HTTPException(status_code=401, detail="Missing access token")

    try:
        payload = decode_jwt(access_token)
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = User.get(db_session, user_id)
        if user:
            return user
        raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
