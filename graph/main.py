from dataclasses import dataclass

import redis
import redisgraph as rg

r = redis.Redis(host='localhost', port=6379)

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
        return [[cast(x) for x in record] for record in res.result_set]


graph = Graph('graph', r)


def User(id, props={}):
    return Node('User', id, props)


def Movie(id, props={}):
    return Node('Movie', id, props)


"""
relations
User knows Movie (with some properties)
User follows User
"""

##############
# EDIT GRAPH #
##############


def upsert_node(n):
    q = "MERGE (n:%s{id:'%s'}) " % (n.label, n.id)
    for k, v in n.props.items():
        q += "SET n.%s = %s " % (k, repr(v))
    graph.query(q)


def delete_node(n):
    q = "MATCH (n:%s{id:'%s'}) " % (n.label, n.id)
    q += "DELETE n "
    graph.query(q)


def upsert_edge(e):
    s, t = e.src, e.dst
    q = "MATCH (s:%s{id:'%s'}) " % (s.label, s.id)
    q += "MATCH (t:%s{id:'%s'}) " % (t.label, t.id)
    q += "MERGE (s)-[:%s]->(t) " % e.relation
    # SET properties
    graph.query(q)


def delete_edge(e):
    s, t = e.src, e.dst
    q = "MATCH (s:%s{id:'%s'}) " % (s.label, s.id)
    q += "MATCH (t:%s{id:'%s'}) " % (t.label, t.id)
    q += "MATCH (s)-[:%s]->(t) " % e.relation
    q += "DELETE r "
    graph.query(q)


###############
# QUERY GRAPH #
###############


def known_movies(user_id):
    q = "MATCH (u:User{id:'%s'}) " % user_id
    q += "MATCH (u)-[:knows]->(m:Movie) "
    q += "RETURN m.id"
    res = graph.query(q)
    return [record[0] for record in res]


def follows(user_id):
    q = "MATCH (u:User{id:'%s'}) " % user_id
    q = "MATCH (u)-[:follows]->(v:User) "
    q += "RETURN v.id"
    res = graph.query(q)
    return [record[0] for record in res]


def known_by(user_id, movie_id):
    q = "MATCH (u:User{id:'%s'}) " % user_id
    q += "MATCH (m:Movie{id:'%s'}) " % movie_id
    q += "MATCH (u)-[:follows]->(v:User)-[:knows]->(m) "
    q += "RETURN v.id"
    res = graph.query(q)
    return [record[0] for record in res]


if __name__ == '__main__':
    u1 = User('u1')
    u2 = User('u2')
    u3 = User('u3')
    m1 = Movie('m1')
    m2 = Movie('m2')
    e1 = Edge(u1, 'follows', u2)
    e2 = Edge(u2, 'knows', m1)
    e3 = Edge(u3, 'knows', m2)
    e4 = Edge(u1, 'follows', u3)

    for node in [u1,u2,u3,m1,m2]:
        upsert_node(node)
    for edge in [e1,e2,e3,e4]:
        upsert_edge(edge)

    print(known_movies('u3'))
    print(known_by('u1', 'm1'))
    print(follows('u1'))
    graph.delete()
