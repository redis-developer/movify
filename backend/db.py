from typing import Optional

from pydantic import BaseModel

from security import verify_password, get_password_hash


class User(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None


class UserInDB(User):
    hashed_password: str


db = {}


def get_user(username: str):
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)


def new_user(username: str, password: str):
    if username in db:
        return False
    db[username] = {
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
