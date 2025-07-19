from uuid import UUID

from sqlalchemy.orm import Session

from src.db import get_db
from src.db.models import Category, User, UserRole
from src.import_export import BaseImporter, store_imported_deck
from src.import_export.custom import CustomImporter

FRENCH_DECK_JSON_PATH = "data/french.json"
CHINESE_DECK_JSON_PATH = "data/chinese.json"


def add_user(email: str, password: str, role: UserRole, db_session: Session) -> User:
    user = User(email=email, role=role)
    user.set_password(password)
    user = user.save(db_session)
    return user


def add_category(user_id: UUID, name: str, db_session: Session) -> Category:
    category = Category(user_id=user_id, name=name)
    category = category.save(db_session)
    return category


def bootstrap():
    with next(get_db()) as db_session:
        add_user("admin@domain.com", "password", UserRole.ADMIN, db_session)
        user = add_user("user@domain.com", "password", UserRole.USER, db_session)

        language_category = add_category(user.id, "Languages", db_session)

        for deck_path in {FRENCH_DECK_JSON_PATH, CHINESE_DECK_JSON_PATH}:
            with open(deck_path, "rb") as file:
                content = file.read()
                importer: BaseImporter = CustomImporter()
                deck_data = importer.parse(content)
                store_imported_deck(
                    deck_data, user.id, db_session, language_category.id
                )


if __name__ == "__main__":
    bootstrap()
