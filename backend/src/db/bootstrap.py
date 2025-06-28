import bcrypt

from src.db import get_db
from src.db.models import User, UserRole


def bootstrap():
    with next(get_db()) as db_session:
        email = "admin@domain"
        password = "password"

        pw_bytes = password.encode("utf-8")
        pw_hashed = bcrypt.hashpw(pw_bytes, bcrypt.gensalt()).decode("utf-8")
        user = User(email=email, password_hash=pw_hashed, role=UserRole.USER)
        user.save(db_session)


if __name__ == "__main__":
    bootstrap()
