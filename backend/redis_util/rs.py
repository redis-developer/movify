from typing import List

from redisearch import (
    Client,
    TextField,
    IndexDefinition,
    # Query,
    Suggestion,
    AutoCompleter,
)

# Creating a client with a given index name
idx = Client("movieIdx", host="redis")
ac = AutoCompleter("autoCompleter", host="redis")

# IndexDefinition is available for RediSearch 2.0+
definition = IndexDefinition(prefix=['idx::mov::'])

try:
    # Creating the index definition and schema
    idx.create_index((
        TextField("title"),
        TextField("year"),
    ), definition=definition)
except Exception:
    pass


def add_mov(m: dict):
    id = m['imdbID']
    title = m['Title']
    year = m['Year']
    idx.redis.hset(
        'idx::mov::'+id, mapping={
            'title': title,
            'year': year,
            'ref': id,
        })
    ac.add_suggestions(Suggestion(title, payload=id))
    if title.startswith('The '):
        ac.add_suggestions(Suggestion(title[4:], payload=id))


def search(q) -> List[str]:
    return [d.ref for d in idx.search(q).docs]


def suggest(q) -> List[str]:
    sugg = ac.get_suggestions(q)
    # with_payloads=True)
    return [s.string for s in sugg]
