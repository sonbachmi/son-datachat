"""
Core business module of the project:

    - Use PandasAI connecting to supported LLMs (OpenAI and BambooLLM)
    - Conduct conversation with user and execute data analysis operation based on prompt

Usage: Import functions directly into client modules.
"""

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
import streamlit as st

load_dotenv()

skip_llm_guard = bool(st.secrets.get('SKIP_LLM_GUARD', False))
if not skip_llm_guard:
    from llm_guard import scan_prompt, scan_output
    from llm_guard.input_scanners import Anonymize, PromptInjection, TokenLimit, Toxicity
    from llm_guard.output_scanners import Deanonymize, NoRefusal, Relevance, Sensitive
    from llm_guard.vault import Vault

    vault = Vault()
    input_scanners = [Anonymize(vault), Toxicity(), TokenLimit(), PromptInjection()]
    output_scanners = [Deanonymize(vault), NoRefusal(), Relevance(), Sensitive()]


class ModelName(str, Enum):
    bamboo = 'bamboo'
    openai = 'openai'


# Security layer applied to conversation
# Use LLM Guard for sanitization
security = False
pandasAISecurity = AdvancedSecurityAgent()


def sanitize_prompt(prompt: str):
    """Scan prompt for security vulnerabilities and sanitize."""
    if not security or skip_llm_guard:
        return prompt
    sanitized_prompt, results_valid, results_score = scan_prompt(input_scanners, prompt)
    if any(results_valid.values()) is False:
        print(f'Prompt {prompt} is not valid, scores: {results_score}')
        raise Exception('Prompt is unsafe')
    return sanitized_prompt


def sanitize_output(sanitized_prompt: str, response_text: str):
    """Scan LLM response for security vulnerabilities and sanitize."""
    if not security or skip_llm_guard:
        return response_text
    sanitized_response_text, results_valid, results_score = scan_output(
        output_scanners, sanitized_prompt, response_text
    )
    if any(results_valid.values()) is False:
        print(f'Output {response_text} is not valid, scores: {results_score}')
        raise Exception('Response is unsafe')
    return sanitized_response_text


def generate_token():
    """Generate random token; used by session creation."""
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))


class Session:
    """Internal Session class

    Used by core module to manage stateful client connections
    All functions documented below are for public use and return void
    """

    inc_id = 0
    bambooLLM = BambooLLM()
    openAiLLM = OpenAI(temperature=0)

    def __init__(self, use_streamlit=False):
        """ Instantiate new session

            Parameters
            use_streamlit (bool): Whether to emit Streamlit specific response, for use by Streamlit client
        """
        Session.inc_id += 1
        self.id = Session.inc_id
        self.use_streamlit = use_streamlit
        self.model = ModelName.openai
        self.token = generate_token()
        self.datasets: list[pd.DataFrame] = []
        self.df = None
        self.agent = None

    def get_config(self):
        return {
            'llm': Session.openAiLLM
            if self.model == ModelName.openai
            else Session.bambooLLM,
            'response_parser': StreamlitResponse if self.use_streamlit else None,
            'open_chars': False,
            'save_charts': True,
            'save_charts_path': os.path.join(os.getcwd(), 'public'),
        }

    def set_model(self, model: ModelName):
        """ Change current LLM model for subsequent use

            Parameters
            model(str): 'openai' or 'bamboo'
        """
        self.model = model
        if self.df is not None and self.agent:
            self.agent = Agent(
                self.df,
                self.get_config(),
                security=pandasAISecurity if security else None,
                memory_size=10,
            )

    def set_data(self, dfs: list[pd.DataFrame]):
        """ Change current dataset

            Parameters
            dfs: List of DataFrames, typically read from input files
        """
        if not len(dfs):
            raise Exception('Setting empty data')
        self.datasets = dfs
        self.select_data(0)

    def select_data(self, index: int, head: int = None):
        """ Change current data selection, including DataFrame and number of head rows

            Parameters
            index (int): Index of DataFrame in list
            head(int): Number of head rows taken from DataFrame
        """
        if index >= len(self.datasets):
            raise Exception('Selecting data out of range')
        df = self.datasets[index]
        self.df = df if not head else df.head(head)
        self.agent = Agent(
            self.df,
            self.get_config(),
            security=pandasAISecurity if security else None,
            memory_size=10,
        )

    def get_chat_response(self, query: str):
        """ Query LLM engine with the prompt, applying security layer if enabled

            Parameters
            query (str): Use prompt

            Returns
            (str | StreamlitResponse): Response from LLM engine
        """
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


# List of sessions to maintain states with individual clients
# For simplicity, this is stored in memory and will be lost on module rerun
# Ideally, persist in server storage and enforce expiration/refresh
sessions: list[Session] = []


# All public functions below are exposed by the core module for use by clients


def create_session(use_streamlit=False):
    """ Create a new session

        Parameters
        use_streamlit (bool): Whether to emit Streamlit specific response

        Returns
        (str): Unique token identifying created session
            Client should attach this token to any subsequent call
    """
    session = Session(use_streamlit)
    sessions.append(session)
    print('Session created', session.token)
    return session.token


def get_session_by_token(token: str):
    """Internal function to get the session based on client submitted token."""
    return next((s for s in sessions if s.token == token), None)


def set_model(name: str, token: str):
    """ Change current LLM model for subsequent use

        See corresponding session method for details.
    """
    model = ModelName.openai if name == 'openai' else ModelName.bamboo
    session = get_session_by_token(token)
    session.set_model(model)


def set_data(dfs: list[pd.DataFrame], token: str):
    """ Change current dataset

        See corresponding session method for details.
    """
    session = get_session_by_token(token)
    session.set_data(dfs)


def get_chat_response(query: str, token: str):
    """ Query LLM engine

        See corresponding session method for details.
    """
    session = get_session_by_token(token)
    response = session.get_chat_response(query)
    return response
