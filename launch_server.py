import os

import uvicorn

os.environ['DATACHAT_ENV'] = 'production'
uvicorn.run("server:api", host="127.0.0.1", port=8001)
del os.environ['DATACHAT_ENV']
