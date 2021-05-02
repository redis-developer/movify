import os
import gspread


# requires creds at .config/gspread/credentials.json
sa = os.environ['GOOGLE_APPLICATION_CREDENTIALS']
gc = gspread.service_account(filename=sa)

gs = gc.open_by_key('1SYfOfOK7QbDD6K0-0qhEvSfk1sO0wg2OJ1DIgYJbe-o')
ws = gs.worksheet('Data')

data = ws.get()  # all strings by default
# TODO resize all rows

rng = 'A2'
rng = 'A2:C3'
data = [[v for v in row] for row in data]
ws.update(rng, data)  # for strings
ws.update(rng, data, raw=False)  # with datetime formated
