from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import Session

from src.auth.oauth import get_access_token_oauth, oauth
from src.db import get_db

router = APIRouter(prefix="/oauth", tags=["auth", "oauth"])


@router.get("/login")
async def login(request: Request):
    redirect_uri = request.url_for("auth")
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/auth")
async def auth(request: Request,
               db_session: Session = Depends(get_db)):
    access_token = await get_access_token_oauth(request, db_session)
    return {"access_token": access_token}
