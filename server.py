import os
import random
import re
import shutil
import string
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from main import create_session, get_session_by_token, Session, ModelName

load_dotenv()

root_path = os.path.dirname(os.path.realpath(__file__))

api = FastAPI()
api.mount('/public', StaticFiles(directory=os.path.join(root_path, 'public')), name='static')

api.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@api.get('/')
def about():
    return {'app': "Son's Data Chat API App"}


class SessionResponse(BaseModel):
    token: str


@api.post('/session')
def create_api_session() -> SessionResponse:
    token = create_session()
    return SessionResponse(token=token)


def get_session(token) -> Session:
    session = get_session_by_token(token)
    if session is None:
        raise HTTPException(status_code=403, detail='Invalid session')
    return session


class SetModelResponse(BaseModel):
    model: str


@api.post('/model')
async def set_model(model: str, token: str) -> SetModelResponse:
    session = get_session(token)
    session.set_model(ModelName.openai if model == 'openai' else ModelName.bamboo)
    print('Switched model to:', model)
    return SetModelResponse(model=model)


class UploadResponse(BaseModel):
    rows: list[int]
    selectedIndex: int


@api.post('/data/input')
async def upload_files(files: list[UploadFile], token: str) -> UploadResponse:
    session = get_session(token)
    rows = []
    dfs = []
    try:
        for file in files:
            extension = os.path.splitext(file.filename)[1][1:].lower()
            if extension not in ['csv', 'xlsx']:
                raise HTTPException(status_code=400, detail='Data file must be CSV or XLSX')
            df = pd.read_csv(file.file) if extension == 'csv' else pd.read_excel(file.file)
            dfs.append(df)
            rows.append(len(df.index))
        session.set_data(dfs)
        return UploadResponse(rows=rows, selectedIndex=0)
    except (IOError, Exception):
        raise HTTPException(status_code=500, detail='System error')


class SetDataResponse(BaseModel):
    selectedIndex: int


@api.post('/data/select')
async def select_data(index: int, head: int, token: str) -> SetDataResponse:
    session = get_session(token)
    session.select_data(index, head)
    return SetDataResponse(selectedIndex=index)


class QueryInput(BaseModel):
    query: str


class QueryResponse(BaseModel):
    answer: str
    type: str
    html: bool


def generate_filename(extension: str) -> str:
    return (
            ''.join(random.choices(string.ascii_lowercase + string.digits, k=24))
            + '.'
            + extension
    )


def render_answer(answer) -> (str, str):
    t = type(answer)
    if t is str:
        if re.search(r'\.(png|jpe?g)$', answer, re.IGNORECASE):
            file = Path(answer)
            if file.is_file():
                try:
                    extension = os.path.splitext(file.name)[1][1:].lower()
                    out_filename = generate_filename(extension)
                    out_path = f'{root_path}/public/{out_filename}'
                    shutil.copy(answer, out_path)
                    public_url = f'{os.environ['SERVER_URL'] or ''}/public/{out_filename}'
                    return str(f'<img src="{public_url}" alt="See image for answer">'), 'html'
                except (IOError, Exception):
                    return str(answer)
    elif t is pd.DataFrame:
        return answer.to_html(), 'html'
    return str(answer)


@api.post('/query')
async def post_query(query: QueryInput, token: str) -> QueryResponse:
    session = get_session(token)
    resp = session.get_chat_response(query.query)
    t = type(resp)
    answer, sformat = render_answer(resp)
    # print('Returning answer:', str_answer)
    return QueryResponse(answer=answer, type=t.__name__, html=sformat == 'html')
