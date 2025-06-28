import uuid
from datetime import datetime, timezone
from enum import StrEnum

from sqlalchemy import UUID, DateTime, ForeignKey, String
from sqlalchemy.orm import DeclarativeBase, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class BaseMixin:
    def save(self, db):
        db.add(self)
        db.commit()
        db.refresh(self)
        return self

    def delete(self, db):
        db.delete(self)
        db.commit()

    @classmethod
    def get(cls, db, id):
        return db.get(cls, id)

    @classmethod
    def all(cls, db):
        return db.query(cls).all()

    @classmethod
    def filter_by(cls, db, **kwargs):
        return db.query(cls).filter_by(**kwargs)


class UserRole(StrEnum):
    GUEST = "guest"
    USER = "user"
    ADMIN = "admin"


class User(Base, BaseMixin):
    __tablename__ = "users"
    id = mapped_column((UUID(as_uuid=True)), primary_key=True, default=uuid.uuid4)
    email = mapped_column(String, unique=True, nullable=False)
    password_hash = mapped_column(String, nullable=False)
    created_at = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    role = mapped_column(String, nullable=False)

    decks = relationship("Deck", back_populates="user")


class Deck(Base, BaseMixin):
    __tablename__ = "decks"
    id = mapped_column((UUID(as_uuid=True)), primary_key=True, default=uuid.uuid4)
    user_id = mapped_column(
        (UUID(as_uuid=True)), ForeignKey("users.id"), nullable=False
    )
    name = mapped_column(String, nullable=False)
    description = mapped_column(String)
    created_at = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = relationship("User", back_populates="decks")
