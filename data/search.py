from redisearch import (
    Client,
    TextField,
    NumericField,
    IndexDefinition,
    # Query,
    Suggestion,
    AutoCompleter,
)

# Creating a client with a given index name
client = Client("myIndex", port=1000)
ac = AutoCompleter("ac", port=1000)

# IndexDefinition is available for RediSearch 2.0+
definition = IndexDefinition(prefix=['mov:'])

try:
    # Creating the index definition and schema
    client.create_index((
        TextField("title"),
        TextField("year"),
    ), definition=definition)
except:
    pass


def add_mov(m):
    id = m['imdbID']
    title = m['Title']
    year = m['Year']
    client.redis.hset(
        'mov:'+id, mapping={
            'title': title,
            'year': year,
            'ref': id,
        })
    ac.add_suggestions(Suggestion(title, payload=id))
    if title.startswith('The '):
        ac.add_suggestions(Suggestion(title[4:], payload=id))

# client.search(str).docs[0].ref
# ac.get_suggestions(str, with_payloads=True)[0].payload
