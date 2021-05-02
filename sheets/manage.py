from googleapiclient.discovery import build
drive = build('drive', 'v3')
fields = 'files(id,name,permissions)'
req = drive.files().list(fields=fields)
# res = req.execute()

fid = '1SYfOfOK7QbDD6K0-0qhEvSfk1sO0wg2OJ1DIgYJbe-o'
req = drive.files().copy(fileId=fid)
# res = req.execute()
fid = '1r0nvBwt-s2mKCfyivoxtY_ewk_f1Ro6PtHqCYvGvSkg'
req = drive.files().copy(
    fileId=fid,
    body={
        'name': 'the title here'
    }
)

req = drive.permissions().create(
    fileId=fid,
    body={
        'role': 'writer',
        'type': 'user',
        'emailAddress': 'matthias@hasler.fr',
    }
)

print(
req.execute()
)
