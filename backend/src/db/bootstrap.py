import bcrypt

from src.db import get_db
from src.db.models import User, UserRole
from src.import_export import BaseImporter, store_imported_deck
from src.import_export.custom import CustomImporter

DECK_JSON_PATH = "data/deck.json"


def bootstrap():
    with next(get_db()) as db_session:
        email = "admin@domain.com"
        password = "password"

        pw_bytes = password.encode("utf-8")
        pw_hashed = bcrypt.hashpw(pw_bytes, bcrypt.gensalt()).decode("utf-8")
        user = User(email=email, password_hash=pw_hashed, role=UserRole.ADMIN)
        user = user.save(db_session)

        print(f"Bootstrapped {email}")

        with open(DECK_JSON_PATH, "rb") as file:
            content = file.read()
            importer: BaseImporter = CustomImporter()
            deck_data = importer.parse(content)
            store_imported_deck(deck_data, user.id, db_session)

        print(f"Bootstrapped {DECK_JSON_PATH}")


if __name__ == "__main__":
    bootstrap()
