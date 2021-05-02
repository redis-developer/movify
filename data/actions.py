"""
autocomplete


search


browse
(filters, sort) -> id list


Movie infos

status (user)

profile
"""

from pydantic import BaseModel
from typing import List


class User(BaseModel):
    id: str
    name: str
    picture: str


class UserRating(User):
    rating: int


class UserStatus(User):
    status: str


class UserProfile(User):
    desc: str


class Movie(BaseModel):
    infos: dict
    friends: List[dict]
