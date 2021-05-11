from typing import Optional
import json
import redis

r = redis.StrictRedis(host="redis")
assert r.ping(), "Couldn't connect to Redis"


def jset(key, value, path='.'):
    value = json.dumps(value)
    res = r.execute_command('JSON.SET', key, path, value)
    assert res == b'OK'


def jget(key, path='.') -> Optional[dict]:
    res = r.execute_command('JSON.GET', key, path)
    return res and json.loads(res)


def jdel(key):
    r.delete(key)


"""
user_id = G:{sub}
movie_id = {imdbID}

id::user::{id} -> username
user::id::{username} -> id

userdata::{id} -> User
moviedata::{id} -> Movie
"""
