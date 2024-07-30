import os
import random
import string
from enum import Enum

import pandas as pd
from dotenv import load_dotenv
from pandasai import Agent
from pandasai.ee.agents.advanced_security_agent import AdvancedSecurityAgent
from pandasai.llm import OpenAI, BambooLLM
from pandasai.responses.streamlit_response import StreamlitResponse

# from llm_guard import scan_output, scan_prompt
# from llm_guard.input_scanners import Anonymize, PromptInjection, TokenLimit, Toxicity
# from llm_guard.output_scanners import Deanonymize, NoRefusal, Relevance, Sensitive
# from llm_guard.vault import Vault

load_dotenv()


class ModelName(str, Enum):
    bamboo = 'bamboo'
    openai = 'openai'


# Security layer
security = False
pandasAISecurity = AdvancedSecurityAgent()

# Temporarily disable LLM Guard packages
# vault = Vault()
# input_scanners = [Anonymize(vault), Toxicity(), TokenLimit(), PromptInjection()]
# output_scanners = [Deanonymize(vault), NoRefusal(), Relevance(), Sensitive()]


def sanitize_prompt(prompt: str):
    return prompt
    # if not security:
    #     return prompt
    # sanitized_prompt, results_valid, results_score = scan_prompt(input_scanners, prompt)
    # if any(results_valid.values()) is False:
    #     print(f'Prompt {prompt} is not valid, scores: {results_score}')
    #     raise Exception('Prompt is unsafe')
    # return sanitized_prompt


def sanitize_output(sanitized_prompt: str, response_text: str):
    return response_text
    # if not security:
    #     return response_text
    # sanitized_response_text, results_valid, results_score = scan_output(
    #     output_scanners, sanitized_prompt, response_text
    # )
    # if any(results_valid.values()) is False:
    #     print(f'Output {response_text} is not valid, scores: {results_score}')
    #     raise Exception('Response is unsafe')
    # return sanitized_response_text


incId = 0


def generate_token():
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))


class Session:
    id: int
    token: str
    model: ModelName = ModelName.openai
    bambooLLM = BambooLLM()
    openAiLLM = OpenAI(temperature=0)
    use_streamlit = False
    agent: Agent = None
    datasets: list[pd.DataFrame] = []
    df: pd.DataFrame = None

    def __init__(self, use_streamlit=False):
        self.id = ++incId
        self.use_streamlit = use_streamlit
        self.token = generate_token()

    def get_config(self):
        return {
            'llm': self.openAiLLM if self.model == ModelName.openai else self.bambooLLM,
            'response_parser': StreamlitResponse if self.use_streamlit else None,
            "save_charts": True,
            "save_charts_path": os.path.join(os.getcwd(), 'public'),
        }

    def set_model(self, model: ModelName):
        self.model = model
        if self.df and self.agent:
            self.agent = Agent(self.df, self.get_config(), security=pandasAISecurity if security else None, memory_size=10)

    def set_data(self, dfs: list[pd.DataFrame]):
        if not len(dfs):
            raise Exception('Setting empty data')
        self.datasets = dfs
        self.select_data(0)

    def select_data(self, index: int, head: int = None):
        if index >= len(self.datasets):
            raise Exception('Selecting data out of range')
        df = self.datasets[index]
        self.df = df if not head else df.head(head)
        self.agent = Agent(self.df, self.get_config(), security=pandasAISecurity if security else None, memory_size=10)

    def get_chat_response(self, query: str):
        # with get_openai_callback() as cb:
        #     response = agent.chat(query)
        #     print("Result:", cb)
        if not self.agent:
            raise Exception('No agent initialized')
        sanitized_query = sanitize_prompt(query)
        response = self.agent.chat(sanitized_query)
        if not isinstance(response, str):
            return response
        return sanitize_output(sanitized_query, response)


sessions: list[Session] = []


def create_session(use_streamlit=False):
    session = Session(use_streamlit)
    sessions.append(session)
    print('Session created', session.token)
    return session.token


def get_session_by_token(token: str):
    session = next((s for s in sessions if s.token == token), None)
    return session


def set_model(name: str, token: str):
    model = ModelName.openai if name == 'openai' else ModelName.bamboo
    session = get_session_by_token(token)
    session.set_model(model)


def set_data(dfs: list[pd.DataFrame], token: str):
    session = get_session_by_token(token)
    session.set_data(dfs)


def get_chat_response(query: str, token: str):
    session = get_session_by_token(token)
    response = session.get_chat_response(query)
    return response
