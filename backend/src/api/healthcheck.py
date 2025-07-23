from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/healthz", status_code=200)
async def healthcheck():
    return "OK"
