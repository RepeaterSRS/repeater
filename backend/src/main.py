from os import getenv

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.sessions import SessionMiddleware

from src.api import auth, decks, oauth
from src.log import set_up_logger

load_dotenv()
set_up_logger()

origins = ["http://localhost:3000"]

app = FastAPI()


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_msg = exc.errors()[0].get("msg")
    return JSONResponse(
        status_code=422,
        content={"detail": error_msg},
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(
    SessionMiddleware,
    secret_key=getenv("SECRET_KEY"),
)

app.include_router(auth.router)
app.include_router(decks.router)
app.include_router(oauth.router)
