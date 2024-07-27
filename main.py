import random
import string
from enum import Enum

import pandas as pd
from dotenv import load_dotenv
from pandasai import Agent
from pandasai.llm import OpenAI, BambooLLM
from pandasai.responses.streamlit_response import StreamlitResponse

load_dotenv()


class ModelName(str, Enum):
    bamboo = 'bamboo'
    openai = 'openai'


incId = 0


def generate_token():
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))


class Session:
    id: int = ++incId
    token: str
    model: ModelName = ModelName.openai
    bambooLLM = BambooLLM()
    openAiLLM = OpenAI()
    use_streamlit = False
    agent: Agent = None
    datasets: list[pd.DataFrame] = []
    df: pd.DataFrame = None

    def __init__(self, use_streamlit=False):
        self.use_streamlit = use_streamlit
        self.token = generate_token()

    def get_config(self):
        return {
            'llm': self.openAiLLM if self.model == ModelName.openai else self.bambooLLM,
            'response_parser': StreamlitResponse if self.use_streamlit else None,
        }

    def set_model(self, model: ModelName):
        self.model = model

    def set_data(self, dfs: list[pd.DataFrame]):
        # df = pd.read_csv('data/titanic.csv', nrows=200)
        if not len(dfs):
            raise Exception('Setting empty data')
        self.datasets = dfs
        self.select_data(0)

    def select_data(self, index: int):
        if index >= len(self.datasets):
            raise Exception('Selecting data out of range')
        self.df = self.datasets[index]
        self.agent = Agent(self.df, self.get_config(), memory_size=10)

    def get_chat_response(self, query: str):
        # with get_openai_callback() as cb:
        #     response = agent.chat(query)
        #     print("Result:", cb)
        if not self.agent:
            raise Exception('No agent initialized')
        return self.agent.chat(query)


sessions: list[Session] = []


def create_session(use_streamlit=False):
    session = Session(use_streamlit)
    sessions.append(session)
    print('Session created', session.token)
    return session.token


def get_session_by_token(token: str):
    session = next((s for s in sessions if s.token == token), None)
    return session


def set_data(dfs: list[pd.DataFrame], token: str):
    session = get_session_by_token(token)
    session.set_data(dfs)


def get_chat_response(query: str, token: str):
    session = get_session_by_token(token)
    response = session.get_chat_response(query)
    return response
