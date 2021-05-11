from typing import List, Optional
from pydantic import BaseModel

from authlib.integrations.starlette_client import OAuth
from config import config

from fastapi import FastAPI, Request, Depends, HTTPException
from starlette.responses import RedirectResponse
from starlette.middleware.sessions import SessionMiddleware

from db import User, MovieInfo, MovieUser
import db


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

DEV = True
host = 'http://127.0.0.1:8000'


@app.get('/login')
async def login(request: Request):
    # absolute url for callback
    # we will define it below
    redirect_uri = host + '/api/auth'
    return await oauth.google.authorize_redirect(request, redirect_uri)


@app.get('/auth')
async def auth(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user = await oauth.google.parse_id_token(request, token)
    uid = 'G:'+user['sub']
    u = db.user_get(uid)
    if u:
        user = dict(u)
    else:
        user['id'] = uid
        user['username'] = 'G:'+user['sub']
        user = User(**user)
        db.user_set(uid, user)
        user = dict(user)
    # add cookie
    request.session['user'] = user['id']
    return RedirectResponse(host)


def get_user(request: Request) -> User:
    uid = request.session.get('user')
    user = uid and db.user_get(uid)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthenticated")
    return user


# read -----------------------------

@app.get('/me')
async def me(user: User = Depends(get_user)):
    return user


@app.get('/suggest')
async def suggest(q: str, u=Depends(get_user)) -> List[str]:
    return db.suggest(u.id, q)


@app.get('/search')
async def search(q: str, u=Depends(get_user)) -> List[MovieInfo]:
    # https://image.tmdb.org/t/p/w500/
    api_key = "b713b3903ca08fb8ddc80e4081d5fcee"
    import requests
    res = requests.get('https://api.themoviedb.org/3/search/movie',
                       params={'api_key': api_key, 'query': q})
    data = res.json()
    for r in data['results']:
        r['perso'] = {}
        r['release_date'] = r['release_date'][:4]
    return [MovieInfo(**r) for r in data['results']]
    # return db.search(u.id, q)


@app.get('/friends')
async def friends(user: User = Depends(get_user)) -> List[User]:
    return db.friends(user.id)


@app.get('/my-movies')
async def my_movies(user: User = Depends(get_user)) -> List[MovieInfo]:
    return db.my_movies(user.id)


# read -----------------------------

@app.put('/movies/{mid}')
def put_user_movie(mid, props: MovieUser,
                   user=Depends(get_user)) -> Optional[MovieInfo]:
    info = db.movie_info(user.id, mid)
    if info is None:
        return None
    db.know_upsert(user.id, mid, dict(props))
    return db.movie_info(user.id, mid)


@app.delete('/movies/{mid}')
def del_user_movie(mid,
                   user=Depends(get_user)) -> Optional[MovieInfo]:
    db.know_delete(user.id, mid)
    return db.movie_info(user.id, mid)


@app.get('/movies/{mid}')
def get_user_movie(mid, user=Depends(get_user)) -> MovieInfo:
    api_key = "b713b3903ca08fb8ddc80e4081d5fcee"
    import requests
    res = requests.get('https://api.themoviedb.org/3/movie/' + mid,
                       params={'api_key': api_key})
    data = res.json()
    data['perso'] = {}
    data['release_date'] = data['release_date'][:4]
    return MovieInfo(**data)
    return db.movie_info(user.id, mid)
