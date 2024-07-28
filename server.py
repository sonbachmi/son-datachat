import os

import pandas as pd
from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from main import create_session, get_session_by_token, Session

api = FastAPI()
api.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@api.get('/')
def read_root():
    return {'app': "Son's CS App"}


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


class UploadResponse(BaseModel):
    rows: list[int]
    selectedIndex: int


@api.post('/data/input')
async def create_upload_files(files: list[UploadFile], token: str) -> UploadResponse:
    session = get_session(token)
    rows = []
    dfs = []
    for file in files:
        extension = os.path.splitext(file.filename)[1][1:].lower()
        if extension not in ['csv', 'xlsx']:
            raise HTTPException(status_code=400, detail='Data file must be CSV or XLSX')
        df = pd.read_csv(file.file) if extension == 'csv' else pd.read_excel(file.file)
        dfs.append(df)
        rows.append(len(df.index))
    session.set_data(dfs)
    return UploadResponse(rows=rows, selectedIndex=0)


class SetDataResponse(BaseModel):
    selectedIndex: int


@api.post('/data/select')
async def post_select_data(index: int, head: int, token: str) -> SetDataResponse:
    session = get_session(token)
    session.select_data(index, head)
    return SetDataResponse(selectedIndex=index)


class QueryInput(BaseModel):
    query: str


class QueryResponse(BaseModel):
    answer: str
    type: str
    html: bool


@api.post('/query')
async def post_query(query: QueryInput, token: str) -> QueryResponse:
    session = get_session(token)
    if session is None:
        raise HTTPException(status_code=400, detail='Invalid session')
    answer = session.get_chat_response(query.query)
    t = type(answer)
    str_answer = answer.to_html() if t is pd.DataFrame else str(answer)
    # print('Returning answer:', str_answer)
    return QueryResponse(answer=str_answer, type=t.__name__, html=t is pd.DataFrame)
