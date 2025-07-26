from typing import Generic, List, Optional, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int
    pages: int
    has_next: bool
    has_prev: bool
    next_page: Optional[int] = None
    prev_page: Optional[int] = None


class PaginationParams(BaseModel):
    page: int = Field(1, ge=1, description="Page number, starting from 1")
    size: int = Field(20, ge=1, le=100, description="Number of items per page")

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.size
