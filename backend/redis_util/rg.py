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
    q = "MERGE (s:%s{id:'%s'}) " % (s.label, s.id)
    q += "MERGE (t:%s{id:'%s'}) " % (t.label, t.id)
    q += "MERGE (s)-[r:%s]->(t) " % e.relation
    for k, v in e.props.items():
        q += "SET r.%s = %s " % (k, repr(v))
    print(q)
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
    q += "MATCH (s)-[r:%s]->(t) " % e.relation
    q += "DELETE r "
    graph.query(q)


def id_props(x):
    return (x and "{id:'%s'}" % x) or ''


class AbstractNode:
    def __init__(self, T):
        self.T = T

    def __call__(self, x, p={}):
        return Node(self.T, x, p)

    def make(self, x, p={}):
        return Node(self.T, x, p)

    def get(self, x):
        q = "MATCH (x1:%s%s) " % (self.T, id_props(x))
        q += "RETURN x1"
        res = graph.query(q)
        return res and res[0].props or None

    def upsert(self, x, p={}):
        node_upsert(self.make(x, p))

    def delete(self, x):
        node_delete(self.make(x))


class AbstractEdge:
    def __init__(self, t1, R, t2):
        self.t1 = t1
        self.R = R
        self.t2 = t2

    def __call__(self, x1, x2, p={}):
        return Edge(self.R, self.t1(x1), self.t2(x2), p)

    def make(self, x1, x2, p={}):
        return Edge(self.R, self.t1(x1), self.t2(x2), p)

    def props(self, x1, x2):
        res = self.get(x1, x2)
        return res and res[0][1] or None

    def upsert(self, x1, x2, props={}):
        edge_upsert(self.make(x1, x2, props))

    def delete(self, x1, x2):
        edge_delete(self.make(x1, x2))

    def get(self, x1=None, x2=None):
        q = "MATCH (x1:%s%s) " % (self.t1.T, id_props(x1))
        q += "MATCH (x2:%s%s) " % (self.t2.T, id_props(x2))
        q += "MATCH (x1)-[r:%s]->(x2) " % self.R
        q += "RETURN x1.id, r, x2.id"
        print(x1, x2, q)
        res = graph.query(q)
        return [(x1, r.props, x2) for x1, r, x2 in res]


User = AbstractNode('User')
Collection = AbstractNode('Collection')
Movie = AbstractNode('Movie')


Follows = AbstractEdge(User, 'FOLLOWS', User)
Has = AbstractEdge(User, 'HAS', Collection)
Contains = AbstractEdge(Collection, 'CONTAINS', Movie)


def in_collections(u1, m1) -> List[str]:
    q = "MATCH (u:User{id:'%s'}) " % u1
    q += "MATCH (m:Movie{id:'%s'}) " % m1
    q += "MATCH (u)-[:HAS]->(c:Collection)-[:CONTAINS]->(m) "
    q += "RETURN c.id"
    res = graph.query(q)
    return res


def known_by_followers(u1, m1) -> List[str]:
    q = "MATCH (u:User{id:'%s'}) " % u1
    q += "MATCH (m:Movie{id:'%s'}) " % m1
    q += "MATCH (u)-[:FOLLOWS]->(v:User)-" \
        "[:HAS]->(:Collection)-[:CONTAINS]->(m) "
    q += "RETURN v.id"
    res = graph.query(q)
    return res


def user_activity(u1) -> List[str]:
    q = "MATCH (v:User{id:'%s'}) " % u1
    q += "MATCH (v)-"\
        "[:HAS]->(c:Collection)-[r:CONTAINS]->(m:Movie) "
    q += "RETURN v.id, c.id, m.id, r.time "
    q += "ORDER BY r.time DESC "
    q += "LIMIT 20 "
    res = graph.query(q)
    return res


def friends_activity(u1) -> List[str]:
    q = "MATCH (u:User{id:'%s'}) " % u1
    q += "MATCH (u)-[:FOLLOWS]->(v:User)-" \
        "[:HAS]->(c:Collection)-[r:CONTAINS]->(m:Movie) "
    q += "RETURN v.id, c.id, m.id, r.time "
    q += "ORDER BY r.time DESC "
    q += "LIMIT 40 "
    res = graph.query(q)
    return res
