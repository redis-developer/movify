import json
import redis

r = redis.StrictRedis()
assert r.ping(), "Couldn't connect to Redis"


def jset(key, value, path='.'):
    value = json.dumps(value)
    res = r.execute_command('JSON.SET', key, path, value)
    assert res == b'OK'


def jget(key, path='.'):
    res = r.execute_command('JSON.GET', key, path)
    if res is None:
        return None
    return json.loads(res)


jset('user:matthias', {'age': 21})
print(
    jget('user:matthias'),
    jget('user:matthias', '.age'),
    jget('user:paul'),
)
