from typing import Optional

from pydantic import BaseModel

from security import verify_password, get_password_hash


class User(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None


class UserInDB(User):
    hashed_password: str


user_db = {
    name: {
        'username': name,
        'password': get_password_hash(name),
    }
    for name in 'matt paul maria'.split()
}

follow_db = {
    'matt': ['paul', 'maria']
}

know_db = {
    'matt': {'PeppaPig': {'seen': '2020-10-01'}}
}


def get_user(username: str):
    if username in user_db:
        user_dict = user_db[username]
        return UserInDB(**user_dict)


def new_user(username: str, password: str):
    if username in user_db:
        return False
    user_db[username] = {
        'username': username,
        'hashed_password': get_password_hash(password),
    }
    return get_user(username)


def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def get_movies(username):
    return know_db.get(username, [])


def get_friends(username):
    return follow_db.get(username, [])


def put_know(username, movie_id, props: dict):
    know_db[username][movie_id] = props
