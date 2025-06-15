from dotenv import load_dotenv
from fastapi import FastAPI

from src.api import auth, decks
from src.log import set_up_logger

load_dotenv()
set_up_logger()

app = FastAPI()
app.include_router(auth.router)
app.include_router(decks.router)
