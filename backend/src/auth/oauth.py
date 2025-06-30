import uuid

import bcrypt
from authlib.integrations.starlette_client import OAuth
from sqlalchemy.orm import Session
from starlette.config import Config

from src.auth.jwt import create_access_token
from src.db.models import User, UserRole

config = Config(".env")
oauth = OAuth(config)
oauth.register(
    name="google",
    client_id=config("GOOGLE_CLIENT_ID"),
    client_secret=config("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)


async def get_access_token_oauth(request, db_session: Session):
    token = await oauth.google.authorize_access_token(request)
    user_info = await oauth.google.parse_id_token(request, token)
    email = user_info["email"]

    user = User.filter_by(db_session, email=email).first()
    if not user:
        password = str(uuid.uuid4())
        pw_bytes = password.encode("utf-8")
        pw_hashed = bcrypt.hashpw(pw_bytes, bcrypt.gensalt()).decode("utf-8")
        user = User(email=email, password_hash=pw_hashed, role=UserRole.USER)
        user.save(db_session)

    return create_access_token(
        {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
        }
    )
