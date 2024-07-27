from enum import Enum

from fastapi import FastAPI, UploadFile


class ModelName(str, Enum):
    bamboo = 'bamboo'
    openai = 'openai'


app = FastAPI()


@app.get('/')
def read_root():
    return {'Hello': 'World'}


@app.get('/items/{item_id}')
def read_item(item_id: int, q: str | None = None):
    return {'item_id': item_id, 'q': q}


@app.post('/files')
async def create_upload_files(files: list[UploadFile]):
    return {
        'filenames': [file.filename for file in files],
        'csv': await files[0].read(),
    }
