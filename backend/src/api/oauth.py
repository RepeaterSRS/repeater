from os import getenv

from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from src.auth.oauth import get_access_token_oauth, oauth
from src.db import get_db

router = APIRouter(prefix="/oauth", tags=["auth", "oauth"])


@router.get("/login")
async def login(request: Request):
    redirect_uri = request.url_for("auth")
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/auth", status_code=302)
async def auth(request: Request, db_session: Session = Depends(get_db)):
    access_token = await get_access_token_oauth(request, db_session)

    frontend_url = getenv("FRONTEND_URL")
    assert frontend_url, "FRONTEND_URL must be set"

    response = RedirectResponse(url=frontend_url, status_code=302)
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=3600,
    )
    return response
