from typing import Optional
import os
import requests

from config import config
apikey = config("OMDB")


def get(title) -> Optional[dict]:
    url = 'http://www.omdbapi.com/'
    res = requests.get(url, params={
        't': title,
        'apikey': apikey,
    })
    try:
        res = res.json()
        if res['Response'] == 'True':
            return res
    except Exception as e:
        print(repr(e))
        # invalid key or smth
