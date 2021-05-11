import requests
from typing import Optional, List

from pydantic import BaseModel

import omdb
from redis_util import rj, rg, rs
from redis_util.rj import r  # main redis client
from redis_util.rg import (
    know_upsert,
    know_delete,
    follow_upsert,
    follow_delete,
)


class User(BaseModel):
    id: str
    username: str
    email: str
    name: str
    picture: str


"""
class Movie(BaseModel):
    Actors: str
    Director: str
    Genre: str
    Poster: str
    Runtime: str
    Title: str
    Year: str
    imdbID: str
"""


class MovieShort(BaseModel):
    id: str
    title: str
    year: str


class Movie(MovieShort):
    poster: Optional[str]


class MovieUser(BaseModel):
    liked: bool = False
    watched: bool = False


class MovieInfo(Movie):
    follow: List[User] = []
    perso: MovieUser


# username to ID ---------------------

def id_upsert(id, new) -> bool:
    if r.get('user::id::'+new) is not None:
        return False
    r.set('user::id::'+new, id)
    old = r.get('id::user::'+id)
    if old:
        r.delete('user::id::'+old)
    r.set('id::user::'+id, new)
    return True


def whois(username) -> Optional[str]:
    return r.get('user::id::'+username)


# users ---------------------------

def user_get(id) -> Optional[User]:
    u = rj.jget('userdata::'+id)
    return u and User(**u)


def user_set(id, u: User):
    rj.jset('userdata::'+id, dict(u))
    rg.user_upsert(id, dict(u))


def follows_get(id) -> List[User]:
    ids = rg.follows(id)
    return [user_get(i) for i in ids]


def follow_add(u1, u2):
    rg.follow_upsert(u1, u2)


def follow_del(u1, u2):
    rg.follow_delete(u1, u2)


# movies ---------------------------

def movie_get(mid):
    key = 'movidata::' + mid
    res = rj.jget(key)
    if res:
        return res
    api_key = "b713b3903ca08fb8ddc80e4081d5fcee"
    res = requests.get('https://api.themoviedb.org/3/movie/' + mid,
                       params={'api_key': api_key})
    if not res.ok:
        raise KeyError('invalid movie id')
    mov = res.json()
    rg.movie_upsert(mid, {})  # empty props in graph
    rj.jset('moviedata::'+mid, mov)  # all in json
    # rs.add_mov(mov)  # add to search?


def movie_info(uid, mid) -> Optional[MovieInfo]:
    info = movie_get(mid)
    if not info:
        return None
    perso = rg.get_know(uid, mid)
    perso = MovieUser(**perso)
    follow = [rj.get('userdata::'+u2)
              for u2 in rg.known_by_follows(uid, mid)]
    info.update(perso=perso, follow=follow)
    return MovieInfo(**info)


def search(uid, q: str, force=False) -> List[MovieInfo]:
    if not force:
        movs = rs.search(q)
        if movs:
            return [movie_info(uid, mid) for mid in movs]
    mov = omdb.get(q)
    if mov is None:
        return None
    mid = mov['imdbID']
    rg.movie_upsert(mid, {})
    rj.jset('moviedata::'+mid, mov)
    rs.add_mov(mov)
    return [movie_info(uid, mid)]


def suggest(uid, q: str) -> List[str]:
    return rs.suggest(q)


def friends(uid) -> List[User]:
    follow = [rj.get('userdata::'+u2)
              for u2 in rg.follows(uid)]
    return follow


def my_movies(uid) -> List[MovieInfo]:
    mov = rg.known_movies(uid)
    return [movie_info(uid, mid) for mid in mov]
