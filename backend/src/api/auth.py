from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def login():
    raise HTTPException(status_code=501)


@router.post("/register")
def register():
    raise HTTPException(status_code=501)
