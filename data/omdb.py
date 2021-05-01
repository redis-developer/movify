import requests

apikey = open('secret_key').read().strip()
url = 'http://www.omdbapi.com/'

res = requests.get(url, params={
    't': 'kill bill',
    'apikey': apikey,
}).json()

if res['Response'] == 'True':
    print('yay')
else:
    print('noo')
