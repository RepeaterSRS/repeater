from datetime import datetime, timedelta, timezone
from os import getenv

import jwt
from fastapi import Cookie, Depends, HTTPException
from sqlalchemy.orm import Session

from src.db import get_db
from src.db.models import User

SECRET_KEY = getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    # Ignore token expiration when testing
    if not getenv("TEST_MODE"):
        to_encode.update({"iat": now, "exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


def get_current_user(
    access_token: str | None = Cookie(default=None),
    db_session: Session = Depends(get_db),
):
    if access_token is None:
        raise HTTPException(status_code=401, detail="Missing access token")

    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        if user := User.get(db_session, user_id):
            return user
        raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
