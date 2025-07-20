from uuid import UUID

from fastapi import Request
from sqlalchemy.orm import Session, contains_eager

from src.auth.jwt import decode_jwt
from src.db.models import Card, Category, Deck, User


def get_user_deck(deck_id: UUID, user_id: UUID, db_session: Session) -> Deck:
    deck = Deck.filter_by(db_session, id=deck_id, user_id=user_id).first()
    if not deck:
        raise ValueError("Deck not found or access denied")
    return deck


def get_user_card(card_id: UUID, user_id: UUID, db_session: Session) -> Card:
    card = (
        db_session.query(Card)
        .join(Deck)
        .filter(Card.id == card_id, Deck.user_id == user_id)
        .options(contains_eager(Card.deck))
        .first()
    )
    if not card or card.deck.user_id != user_id:
        raise ValueError("Card not found or access denied")
    return card


def get_user_category(
    category_id: UUID, user_id: UUID, db_session: Session
) -> Category:
    category = Category.filter_by(db_session, id=category_id, user_id=user_id).first()
    if not category or category.user_id != user_id:
        raise ValueError("Category not found or access denied")
    return category


def get_user_from_token(request: Request, db_session: Session) -> User | None:
    token = request.cookies.get("access_token")
    if not token:
        return None
    try:
        payload = decode_jwt(token)
        user_id = payload.get("sub")
        if not user_id:
            return None
        user = User.get(db_session, user_id)
        return user
    except Exception:
        return None


def would_create_cycle(category_id: UUID, new_parent_category: Category) -> bool:
    current = new_parent_category
    while current:
        if current.id == category_id:
            return True
        current = current.parent
    return False


def calculate_depth(category: Category):
    parent_depth = get_depth_to_root(category)
    category_subtree_depth = get_depth_below(category)
    return parent_depth + category_subtree_depth


def get_depth_to_root(category: Category) -> int:
    depth = 0
    current = category
    while current.parent_id:
        current = current.parent
        depth += 1
    return depth


def get_depth_below(category: Category) -> int:
    depth = 0

    def traverse(category: Category, current_depth: int):
        nonlocal depth
        depth = max(depth, current_depth)

        for child in category.children:
            traverse(child, current_depth + 1)

    traverse(category, 0)
    return depth
