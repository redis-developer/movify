from typing import List
from dataclasses import dataclass

import redis
import redisgraph as rg

r = redis.StrictRedis(host='redis', port=6379)


@dataclass
class Node:
    label: str
    id: str
    props: dict


@dataclass
class Edge:
    relation: str
    src: Node
    dst: Node
    props: dict


def cast(x):
    if isinstance(x, rg.Node):
        return Node(
            x.label,
            x.properties['id'],
            x.properties,
        )
    if isinstance(x, rg.Edge):
        return Edge(
            x.relation,
            cast(x.src_node),
            cast(x.dest_node),
            x.properties,
        )
    else:
        return x  # str or int


class Graph:
    def __init__(self, name, redis):
        self.g = rg.Graph(name, redis)

    def query(self, q):
        res = self.g.query(q)
        res = [[cast(x) for x in record] for record in res.result_set]
        if res and len(res[0]) == 1:
            res = [r[0] for r in res]
        return res


graph = Graph('graph', r)


# GRAPH OPERATIONS -----------------------

def node_upsert(n):
    q = "MERGE (n:%s{id:'%s'}) " % (n.label, n.id)
    for k, v in n.props.items():
        q += "SET n.%s = %s " % (k, repr(v))
    graph.query(q)


def node_delete(n):
    q = "MATCH (n:%s{id:'%s'}) " % (n.label, n.id)
    q += "DELETE n "
    graph.query(q)


def edge_upsert(e):
    s, t = e.src, e.dst
    q = "MATCH (s:%s{id:'%s'}) " % (s.label, s.id)
    q += "MATCH (t:%s{id:'%s'}) " % (t.label, t.id)
    q += "MERGE (s)-[r:%s]->(t) " % e.relation
    for k, v in e.props.items():
        q += "SET r.%s = %s " % (k, repr(v))
    graph.query(q)
    """
    q += "RETURN r"
    res = graph.query(q)
    print(res)
    """


def edge_delete(e):
    s, t = e.src, e.dst
    q = "MATCH (s:%s{id:'%s'}) " % (s.label, s.id)
    q += "MATCH (t:%s{id:'%s'}) " % (t.label, t.id)
    q += "MATCH (s)-[:%s]->(t) " % e.relation
    q += "DELETE r "
    graph.query(q)


# Nodes -----------------------

def User(id, props={}):
    return Node('User', id, props)


def Movie(id, props={}):
    return Node('Movie', id, props)


def user_upsert(id, props: dict):
    u = User(id, props)
    node_upsert(u)


def user_delete(id):
    u = User(id)
    node_delete(u)


def movie_upsert(id, props: dict):
    m = Movie(id, props)
    node_upsert(m)


def movie_delete(id):
    m = Movie(id)
    node_delete(m)


# Edges -----------------------

def Follow(u1: str, u2: str, props={}):
    return Edge('follow', User(u1), User(u2), props)


def Know(u1: str, m1: str, props={}):
    return Edge('know', User(u1), Movie(m1), props)


def follow_upsert(u1: str, u2: str, props: dict = {}):
    e = Follow(u1, u2, props)
    edge_upsert(e)


def follow_delete(u1: str, u2: str):
    e = Follow(u1, u2)
    edge_delete(e)


def know_upsert(u1: str, m1: str, props: dict = {}):
    e = Know(u1, m1, props)
    edge_upsert(e)


def know_delete(u1: str, m1: str):
    e = Know(u1, m1)
    edge_delete(e)


# Queries ----------------

def get_know(u1, m1) -> dict:
    q = "MATCH (u:User{id:'%s'}) " % u1
    q += "MATCH (m:Movie{id:'%s'}) " % m1
    q += "MATCH (u)-[r:know]->(m) "
    q += "RETURN r"
    res = graph.query(q)
    return res and res[0].props or {}


def follows(u1) -> List[str]:
    q = "MATCH (u:User{id:'%s'}) " % u1
    q += "MATCH (u)-[:follow]->(v:User) "
    q += "RETURN v.id"
    return graph.query(q)


def known_movies(u1) -> List[str]:
    q = "MATCH (u:User{id:'%s'}) " % u1
    q += "MATCH (u)-[:know{like:true}]->(m:Movie) "
    q += "RETURN m.id"
    return graph.query(q)


def known_by_follows(u1, m1) -> List[str]:
    q = "MATCH (u:User{id:'%s'}) " % u1
    q += "MATCH (m:Movie{id:'%s'}) " % m1
    q += "MATCH (u)-[:follow]->(v:User)-[:know]->(m) "
    q += "RETURN v.id"
    return graph.query(q)
