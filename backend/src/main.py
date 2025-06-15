from dotenv import load_dotenv
from fastapi import FastAPI

from src.api import auth

load_dotenv()

app = FastAPI()
app.include_router(auth.router)
