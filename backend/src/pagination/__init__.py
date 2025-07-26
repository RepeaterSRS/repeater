from math import ceil
from typing import List, TypeVar

from fastapi import Query
from sqlalchemy.orm import Session

from src.schemas.pagination import PaginatedResponse, PaginationParams

T = TypeVar("T")


def create_paginated_response(
    items: List[T], total: int, page: int, size: int
) -> PaginatedResponse[T]:
    pages = ceil(total / size) if total > 0 else 0
    has_next = page < pages
    has_prev = page > 1

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        size=size,
        pages=pages,
        has_next=has_next,
        has_prev=has_prev,
        next_page=page + 1 if has_next else None,
        prev_page=page - 1 if has_prev else None,
    )


class PaginationService:
    def __init__(self, db: Session):
        self.db = db

    def paginate(self, query, page: int, size: int) -> PaginatedResponse:
        total = query.count()

        offset = (page - 1) * size
        items = query.offset(offset).limit(size).all()

        return create_paginated_response(items, total, page, size)


def get_pagination_params(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
) -> PaginationParams:
    return PaginationParams(page=page, size=size)
