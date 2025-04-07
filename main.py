import chess#https://github.com/niklasf/python-chess
from chatGPT import GPT_ANALYSE_RESPONSE,gpt_analyse_move


response:GPT_ANALYSE_RESPONSE = gpt_analyse_move("")

# from fastapi import FastAPI

# app = FastAPI()

# @app.get("/")
# def read_root():
#     return {"message": "Bienvenue sur mon API!"}

# @app.get("/items/{item_id}")
# def read_item(item_id: int, q: str = None):
#     return {"item_id": item_id, "q": q}