from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel


class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    parent_id: Optional[UUID] = None


class CategoryOut(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    description: Optional[str] = None
    parent_id: Optional[UUID] = None
    is_root: bool
    path: List[str]
    created_at: datetime
    updated_at: datetime


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[UUID] = None


class DeckSummary(BaseModel):
    id: UUID
    name: str


class CategoryNode(BaseModel):
    id: UUID
    name: str
    decks: List[DeckSummary] = []
    children: List[CategoryNode] = []
    deck_count: int = 0
    depth: int = 0


class CategoryTree(BaseModel):
    categories: List[CategoryNode] = []
    uncategorized_decks: List[DeckSummary] = []

    total_categories: int = 0
    total_decks: int = 0
    tree_depth: int = 0
