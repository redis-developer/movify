# Movify
## the social network for cinephiles

this is an entry the Build on Redis 2021 Hackathon.
The website should be up at [this address](https://redishacks.ew.r.appspot.com/collections) until mid-June at least.

Movify is a website where people can get information about
their favorite movies, and share collections with their friends.

Our database is simply a Redis cluster.
Thanks to powerful Redis Modules like RedisGraph,
we are able to perform complex queries in Cypher,
while writing short code.

The app was built with FastAPI (Python), React (JS) and
uses nginx as a reverse-proxy.

For development, use the `docker-compose.yaml` config file.
The files related to production are located under `prod/`


## database

We use the TMDB API to fetch new movies
and to search a huge collection.
Results are cached by the server with a LRU policy.

User generated data is stored in a RedisGraph graph and in JSON blobs,
where they can be updated with the RedisJSON module.

The graph contains 3 types of nodes (User, Movie, Collection) and 3 types of edges:

```
User -[:FOLLOWS]> User
User -[:HAS]> Collection
Collection -[:CONTAINS]> Movie {time}
```

Having collections in the Graph gives us 
flexible and efficient querying.

Metadata associated to users and collections
are stored as JSON:
```
User {id, picture, name}
Collection {id, name, description}
```

## env

Secrets for the Google Client and API keys are not in the repository.
`backend/.env` has the following keys:

```
GOOGLE_CLIENT_ID= for user authentication
GOOGLE_CLIENT_SECRET=
SECRET_KEY= session encryption
TMDB= tmdb API key
```

