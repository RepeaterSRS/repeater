from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.auth.jwt import get_current_user
from src.db import get_db
from src.db.models import Category, Deck, User
from src.schemas.category import (
    CategoryCreate,
    CategoryNode,
    CategoryOut,
    CategoryTree,
    CategoryUpdate,
    DeckSummary,
)
from src.util import get_depth_to_root, get_user_category, would_create_cycle

router = APIRouter(prefix="/categories", tags=["categories"])


@router.post("", response_model=CategoryOut, status_code=201)
def create_category(
    category_req: CategoryCreate,
    user: User = Depends(get_current_user),
    db_session: Session = Depends(get_db),
):
    if category_req.parent_id:
        try:
            get_user_category(category_req.parent_id, user.id, db_session)
        except ValueError as err:
            raise HTTPException(status_code=404, detail=str(err))

    category = Category(
        user_id=user.id,
        name=category_req.name,
        description=category_req.description,
        parent_id=category_req.parent_id,
    )
    category.save(db_session)
    return category


@router.get("", response_model=List[CategoryOut])
def get_categories(
    user: User = Depends(get_current_user), db_session: Session = Depends(get_db)
):
    return user.categories


@router.get("/tree", response_model=CategoryTree)
def get_categories_tree(
    user: User = Depends(get_current_user), db_session: Session = Depends(get_db)
):
    categories = Category.filter_by(db_session, user_id=user.id).all()
    uncategorized_decks = Deck.filter_by(
        db_session, user_id=user.id, category_id=None
    ).all()

    category_map = {cat.id: cat for cat in categories}
    root_categories = []
    max_depth = 0

    def build_node(category: Category) -> CategoryNode:
        decks = [DeckSummary(id=deck.id, name=deck.name) for deck in category.decks]
        node_depth = get_depth_to_root(category) + 1
        nonlocal max_depth
        max_depth = max(max_depth, node_depth)
        children = [
            build_node(category_map[child.id])
            for child in categories
            if child.parent_id == category.id
        ]

        return CategoryNode(
            id=category.id,
            name=category.name,
            decks=decks,
            children=children,
            deck_count=len(decks),
            depth=node_depth,
        )

    for category in categories:
        if category.parent_id is None:
            root_categories.append(build_node(category))

    return CategoryTree(
        categories=root_categories,
        uncategorized_decks=[
            DeckSummary(id=deck.id, name=deck.name) for deck in uncategorized_decks
        ],
        total_categories=len(categories),
        total_decks=sum([len(c.decks) for c in categories]) + len(uncategorized_decks),
        max_depth=max_depth,
    )


@router.patch("/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: UUID,
    category_req: CategoryUpdate,
    user: User = Depends(get_current_user),
    db_session: Session = Depends(get_db),
):
    try:
        category = get_user_category(category_id, user.id, db_session)
    except ValueError as err:
        raise HTTPException(status_code=404, detail=str(err))

    if category_req.parent_id:
        try:
            parent_category = get_user_category(
                category_req.parent_id, user.id, db_session
            )
        except ValueError as err:
            raise HTTPException(status_code=404, detail=str(err))

        if would_create_cycle(category.id, parent_category):
            raise HTTPException(
                status_code=400, detail="Would create circular reference"
            )

    if category_req.parent_id == category_id:
        raise HTTPException(
            status_code=400, detail="Can't set category to be its own parent"
        )

    updates = category_req.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(category, field, value)
    category.save(db_session)
    return category


@router.delete("/{category_id}")
def delete_category(
    category_id: UUID,
    user: User = Depends(get_current_user),
    db_session: Session = Depends(get_db),
):
    try:
        category = get_user_category(category_id, user.id, db_session)
    except ValueError as err:
        raise HTTPException(status_code=404, detail=str(err))

    try:
        for child in category.children:
            child.parent_id = category.parent_id
            db_session.add(child)

        for deck in category.decks:
            deck.category_id = category.parent_id
            db_session.add(deck)

        db_session.commit()

        category.delete(db_session)
        return {"id": category.id}
    except Exception:
        db_session.rollback()
        raise
