from typing import List
from pydantic import BaseModel

from authlib.integrations.starlette_client import OAuth
from starlette.config import Config

from fastapi import FastAPI, Request, Depends, HTTPException
from starlette.responses import RedirectResponse
from starlette.middleware.sessions import SessionMiddleware

from db import (
    User,
    get_user,
    new_user,
    authenticate_user,
    get_friends,
    get_movies,
)
import db

from security import (
    decode_token,
    create_access_token,
)


config = Config('.env')  # read config from .env file
oauth = OAuth(config)
oid = 'https://accounts.google.com/.well-known/openid-configuration'
oauth.register(
    name='google',
    server_metadata_url=oid,
    client_kwargs={
        'scope': 'openid email profile'
    }
)

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key=config('SECRET_KEY'))


@app.get('/login')
async def login(request: Request):
    # absolute url for callback
    # we will define it below
    redirect_uri = 'http://127.0.0.1:8000/api/auth'  # request.url_for('auth')
    return await oauth.google.authorize_redirect(request, redirect_uri)


@app.get('/auth')
async def auth(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user = await oauth.google.parse_id_token(request, token)
    # add cookie
    request.session['user'] = user
    # TODO persist to DB
    return RedirectResponse('me')


class User(BaseModel):
    name: str
    email: str
    picture: str


def get_user(request: Request) -> User:
    user = request.session.get('user')
    if not user:
        raise HTTPException(status_code=401, detail="Unauthenticated")
    return User(**user)


@app.get('/me')
async def me(user: User = Depends(get_user)):
    return user


@app.get('/suggest')
async def suggest(q: str) -> List[str]:
    return db.suggest(q)


@app.get('/search')
async def search(q: str) -> List[str]:
    return db.search(q)


@app.get('/friends')
async def friends(user: User = Depends(get_user)) -> List[str]:
    return db.friends(user)
