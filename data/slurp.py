import json


def get_data():
    with open('data.jsonl') as f:
        data = f.read().split('\n')
        data = filter(None, data)
        data = map(json.loads, data)
        return list(data)
