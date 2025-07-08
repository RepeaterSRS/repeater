import logging
from os import getenv

from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from src.auth.jwt import (
    create_access_token,
    create_refresh_token,
    get_access_token_cookie_kwargs,
    get_refresh_token_cookie_kwargs,
)
from src.auth.oauth import get_user_oauth, oauth
from src.db import get_db

router = APIRouter(prefix="/oauth", tags=["auth", "oauth"])


@router.get("/login")
async def login(request: Request):
    redirect_uri = request.url_for("auth")
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/auth", status_code=302)
async def auth(request: Request, db_session: Session = Depends(get_db)):
    user = await get_user_oauth(request, db_session)

    access_token = create_access_token(user)
    refresh_token = create_refresh_token(user)

    frontend_url = getenv("FRONTEND_URL")
    assert frontend_url, "FRONTEND_URL must be set"

    logging.info(f"Authorized {user.email} via oauth")

    response = RedirectResponse(url=frontend_url, status_code=302)
    response.set_cookie(**get_access_token_cookie_kwargs(access_token))
    response.set_cookie(**get_refresh_token_cookie_kwargs(refresh_token))
    return response
