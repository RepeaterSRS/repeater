import uuid
from datetime import datetime, timezone
from enum import StrEnum

from sqlalchemy import UUID, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import DeclarativeBase, mapped_column, relationship

from src.const import SCHEDULE_DEFAULT_EASE_FACTOR


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


class ReviewFeedback(StrEnum):
    OK = "ok"
    SKIPPED = "skipped"
    FORGOT = "forgot"


class User(Base, BaseMixin):
    __tablename__ = "users"
    id = mapped_column((UUID(as_uuid=True)), primary_key=True, default=uuid.uuid4)
    email = mapped_column(String, unique=True, nullable=False)
    password_hash = mapped_column(String)
    created_at = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    role = mapped_column(String, nullable=False)
    auth_provider = mapped_column(String, default="password", nullable=False)

    decks = relationship("Deck", back_populates="user")
    reviews = relationship("Review", back_populates="user")


class Deck(Base, BaseMixin):
    __tablename__ = "decks"
    id = mapped_column((UUID(as_uuid=True)), primary_key=True, default=uuid.uuid4)
    user_id = mapped_column(
        (UUID(as_uuid=True)), ForeignKey("users.id"), nullable=False
    )
    name = mapped_column(String, nullable=False)
    description = mapped_column(String)
    created_at = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = relationship("User", back_populates="decks")
    cards = relationship("Card", back_populates="deck", cascade="all, delete-orphan")


class Card(Base, BaseMixin):
    __tablename__ = "cards"
    id = mapped_column((UUID(as_uuid=True)), primary_key=True, default=uuid.uuid4)
    deck_id = mapped_column(
        (UUID(as_uuid=True)), ForeignKey("decks.id"), nullable=False
    )
    content = mapped_column(String)
    next_review_date = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    created_at = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    deck = relationship("Deck", back_populates="cards")
    reviews = relationship("Review", back_populates="card")


class Review(Base, BaseMixin):
    __tablename__ = "reviews"
    id = mapped_column((UUID(as_uuid=True)), primary_key=True, default=uuid.uuid4)
    card_id = mapped_column(
        (UUID(as_uuid=True)), ForeignKey("cards.id"), nullable=False
    )
    user_id = mapped_column(
        (UUID(as_uuid=True)), ForeignKey("users.id"), nullable=False
    )
    reviewed_at = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    feedback = mapped_column(String, nullable=False)
    interval = mapped_column(Integer, nullable=False)
    repetitions = mapped_column(Integer, nullable=False)
    ease_factor = mapped_column(
        Float, default=SCHEDULE_DEFAULT_EASE_FACTOR, nullable=False
    )
    created_at = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    card = relationship("Card", back_populates="reviews")
    user = relationship("User", back_populates="reviews")

    def review_succeeded(self):
        return self.feedback in {ReviewFeedback.OK}

    def review_failed(self):
        return self.feedback in {ReviewFeedback.FORGOT}
