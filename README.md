# Movify
**the social network for cinephiles**

![screen1](https://github.com/drhasler/redis21/raw/main/res/screen1.png)

![screen2](https://github.com/drhasler/redis21/raw/main/res/screen2.png)

this is an entry the Build on Redis 2021 Hackathon.
The website should be up at [this address](https://redishacks.ew.r.appspot.com/) until mid-June at least.

Movify is a website where people can get information about
their favorite movies, and share collections with their friends.

Our database is simply a Redis cluster.
Thanks to powerful Redis Modules like RedisGraph,
we are able to perform complex queries in Cypher,
while writing short code.

The app was built with FastAPI (Python), React (JS) and
uses nginx as a reverse-proxy.

## quick start

To launch the app locally, you will need docker-compose.
For security reasons, `backend/.env` is not on this repo.
Since we rely on Google Sign-in for authentication,
you will need to create a [Web client](https://console.cloud.google.com/apis/credentials?),
and register `http://127.0.0.1:8000/api/auth` as authorized redirect URI.
Generate a random string for the encryption `openssl rand -hex 16`.
Finally, create a TMDB account and [get an API key](https://developers.themoviedb.org/3/getting-started/introduction).

You can now fill the `.env` file as follows:

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SECRET_KEY=
TMDB=
```

The script `run.sh` will build the images and start the containers.


## folder structure

Most of the code is located under `frontend/` and `backend/`.

The files related to production are located under `prod/`

For development, use the `docker-compose.yaml` config file.

Interfaces are defined at `backend/main.py` and `frontend/src/actions/Actions.js`.
The interactions with RedisGraph are defined in `backend/redis_util/rg.py`.
The specialized abstract classes provide the methods upsert, delete and get/props,
which can be used without worrying about interfaces.

```python
# create classes
User = AbstractNode('User')
Follows = AbstractEdge(User, 'FOLLOWS', User)
# use
Follows.upsert('id1', 'id2', {'props': 'value'})
Follows.get('id1', None) # followed by id1
Follows.get(None, 'id2') # followers of id2
```

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

Sidenote:
we initially thought we could have a good use case for the RediSearch module,
and wrote some code in `backend/redis_util/rs.py`. The current app doesn't
use the module anymore.


## Extensibility

The website is cool, but building this app was also an opportunity
to experiment with the modules and build some tooling.

The collections our data model relies on can be transformed
to suit real world use cases: they share similarities with
roles in Identity Access Management, as they stand between users and resources.

With the AbstractNode and AbstractEdge "meta"classes, one can add a new type of
node or relation, in a single line, and get methods for CRUD operations for free,
which is quite practical and reduces the number of possible bugs.
