from datetime import datetime
import os
import uuid
from typing import List

from authlib.integrations.starlette_client import OAuth
from config import config

from fastapi import FastAPI, Request, Depends, HTTPException
from starlette.responses import RedirectResponse
from starlette.middleware.sessions import SessionMiddleware

from classes import User, ListResult
from redis_util import rg, rj
import db
import tmdb


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
host = os.environ['HOST']


def parse_ts(timestamp: str):
    return datetime.fromisoformat(timestamp)


def now() -> str:
    return datetime.now().isoformat()


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
    uid = user['sub']
    u = db.user_get(uid)
    if u:
        user = dict(u)
    else:
        user['id'] = uid
        user['username'] = user['sub']
        user = User(**user)
        db.user_set(uid, user)
        for name in ['Liked', 'Watched']:
            cid = uuid.uuid4().hex
            rg.Has.upsert(uid, cid, {'time': now()})
            props = {
                'id': cid,
                'name': name,
                'desc': '',
            }
            rj.set('collection::'+cid, props)
        user = dict(user)
    # add cookie
    request.session['user'] = user['id']
    return RedirectResponse(host)


def get_user(request: Request) -> User:
    uid = request.session.get('user')
    if uid is None:
        raise HTTPException(status_code=401, detail="Unauthenticated")
    user = rj.get('userdata::'+uid)
    return User(**user)


@app.get('/me')
async def me(user: User = Depends(get_user)):
    return user


@app.put('/follows/{uid}')
def put_follow(uid, user: User = Depends(get_user)) -> List[User]:
    rg.Follows.upsert(user.id, uid)
    return 'OK'


@app.delete('/follows/{uid}')
def del_follow(uid: str, user: User = Depends(get_user)) -> List[User]:
    rg.Follows.delete(user.id, uid)
    return 'OK'


@app.get('/users/{uid}/follows')
def get_follows(uid: str, user: User = Depends(get_user)):
    res = rg.Follows.get(uid)
    res = [y for x, p, y in res]
    res = [rj.get('userdata::'+uid) for uid in res]
    return [{
        'id': r['id'],
        'name': r['name'],
        'picture': r['picture'],
    } for r in res]


@app.get('users/{uid}/followers')
def get_followers(uid: str, user: User = Depends(get_user)) -> List[User]:
    res = rg.Follows.get(None, user.id)
    res = [y for x, p, y in res]
    res = [rj.get('userdata::'+uid) for uid in res]
    return res


@app.get('/users/{uid}')
def profile(uid: str, user: User = Depends(get_user)):
    res = rj.get('userdata::'+uid)
    print(user.id, uid)
    rel = bool(rg.Follows.get(user.id, uid))
    # TODO collections
    return res and {
        'username': res['username'],
        'name': res['name'],
        'picture': res['picture'],
        'follows': rel,
        'collections': [],
    }


def known_by(uid, mid):
    res = rg.known_by_followers(uid, mid)
    res = [rj.get('userdata::'+uid) for uid in res]
    return [{
        'id': user['id'],
        'name': user['name'],
        'picture': user['picture'],
    } for user in res]


@app.get('/movies/{mid}')
def get_movie(mid, u: User = Depends(get_user)):
    r = tmdb.get(mid)
    # TODO collections
    return r and {
        'info': r,
        'collections': rg.in_collections(u.id, r['id']),
        'friends': known_by(u.id, r['id']),
    }


@app.get('/search')
def search(q: str, u=Depends(get_user)) -> List[ListResult]:
    res = tmdb.search(q)
    return [{
        'info': r,
        'collections': rg.in_collections(u.id, r['id']),
        'friends': known_by(u.id, r['id']),
    } for r in res]
    # return db.search(u.id, q)


@app.get('/users/{uid}/collections')
def get_collections(uid, u=Depends(get_user)) -> List[dict]:
    res = rg.Has.get(uid)
    print(res)
    return [rj.get('collection::'+c) for u, _, c in res]


@app.put('/collections/{cid}')
def put_collection(cid, props: dict, u=Depends(get_user)):
    rj.set('collection::'+cid, props)
    return 'OK'


@app.post('/collections')
def new_collection(u=Depends(get_user)):
    cid = uuid.uuid4().hex
    rg.Has.upsert(u.id, cid, {'time': now()})
    props = {
        'id': cid,
        'name': 'new collection',
        'desc': '',
    }
    rj.set('collection::'+cid, props)
    return props


@app.get('/collections/{cid}')
def get_collection(cid, u=Depends(get_user)):
    res = [m for c, _, m in rg.Contains.get(cid)]
    res = [tmdb.get(mid) for mid in res]
    return {
        'info': rj.get('collection::'+cid),
        'movies': [{
            'info': r,
            'collections': rg.in_collections(u.id, r['id']),
            'friends': known_by(u.id, r['id']),
        } for r in res]
    }


@app.delete('/collections/{cid}')
def del_collection(cid, u=Depends(get_user)):
    rg.Collection.delete(cid)
    return 'OK'


@app.put('/collections/{cid}/movies/{mid}')
def insert_collection(cid, mid, u=Depends(get_user)):
    rg.Contains.upsert(cid, mid, {'time': now()})
    return 'OK'


@app.delete('/collections/{cid}/movies/{mid}')
def pop_collection(cid, mid, u=Depends(get_user)):
    rg.Contains.delete(cid, mid)
    return 'OK'


def activity_dict(x):
    uid, cid, mid, time = x
    user = rj.get('userdata::'+uid)
    coll = rj.get('collection::'+cid)
    mov = tmdb.get(mid)
    return {
        'user': {
            'id': user['id'],
            'name': user['name'],
            'picture': user['picture'],
        },
        'collection': {
            'id': coll['id'],
            'name': coll['name'],
        },
        'movie': {
            'id': mov['id'],
            'title': mov['title'],
            'poster': mov['poster'],
        }
    }


@app.get('/activity')
def fri_activity(u=Depends(get_user)):
    return [activity_dict(x)
            for x in rg.friends_activity(u.id)]


@app.get('/users/{uid}/activity')
def usr_activity(uid, u=Depends(get_user)):
    return [activity_dict(x)
            for x in rg.user_activity(uid)]
