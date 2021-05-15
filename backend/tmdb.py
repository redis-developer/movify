from functools import lru_cache
from typing import List
from classes import MovieShort
import requests
from config import config


api_key = config("TMDB")
api = 'https://api.themoviedb.org/3'
img_prefix = "https://image.tmdb.org/t/p/w500"


@lru_cache(maxsize=300)
def search(query) -> List[MovieShort]:
    res = requests.get(api + '/search/movie',
                       params={'api_key': api_key, 'query': query})
    res = res.json()
    return [{
        'id': str(r['id']),
        'title': r['title'],
        'year': (r.get('release_date') or '')[:4],
        'poster': r['poster_path'] and img_prefix+r['poster_path'],
    } for r in res['results']]


@lru_cache(maxsize=3000)
def get(mid):
    res = requests.get(api + '/movie/' + mid,
                       params={'api_key': api_key})
    r = res.json()
    x = {
        'id': str(r['id']),
        'title': r['title'],
        'year': r['release_date'][:4],
        'poster': r['poster_path'] and img_prefix+r['poster_path'],

        'genres': [g['name'] for g in r.get('genres', [])],
    }
    for k in [
            'popularity',
            'original_language',
            'overview',
            'revenue',
            'runtime',
    ]:
        if k in r:
            x[k] = r[k]

    res = requests.get(f'{api}/movie/{mid}/credits',
                       params={'api_key': api_key})
    r = res.json()
    print(r.keys())

    x['cast'] = [{
        'name': per['name'],
        'character': per['character'],
    } for per in r['cast'][:5]]
    x['crew'] = [{
        'name': per['name'],
        'job': per['job'],
    } for per in r['crew'][:5]]
    return x
