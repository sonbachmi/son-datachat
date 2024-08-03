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
import streamlit as st
from dotenv import load_dotenv
from pandasai import Agent
from pandasai.llm import OpenAI, BambooLLM
from pandasai.responses.streamlit_response import StreamlitResponse

load_dotenv()


# Security layer applied to conversation
# Use LLM Guard to scan and sanitize text
# Turn off by default.
security = False

# Only use PandasAI's Advanced Security Agent feature after license checking
pandasAISecurity = None # AdvancedSecurityAgent() if Security else None

# Initialize LLM Guard
# Only use this after installing llm_guard and uncommenting related code here

# skip_llm_guard = not security or bool(st.secrets.get('SKIP_LLM_GUARD', False))
# if not skip_llm_guard:
#     from llm_guard import scan_prompt, scan_output
#     from llm_guard.input_scanners import Anonymize, PromptInjection, TokenLimit, InvisibleText
#     from llm_guard.output_scanners import Deanonymize, NoRefusal, Sensitive
#     from llm_guard.vault import Vault
#
#     vault = Vault()
#     input_scanners = [Anonymize(vault), TokenLimit(), PromptInjection(), InvisibleText()]
#     output_scanners = [Deanonymize(vault), NoRefusal(), Sensitive()]


class ModelName(str, Enum):
    bamboo = 'bamboo'
    openai = 'openai'


def sanitize_prompt(prompt: str):
    """Scan prompt for security vulnerabilities and sanitize."""
    return prompt
    # Only use LLM Guard when security enabled
    # if not security or skip_llm_guard:
    #     return prompt
    # sanitized_prompt, results_valid, results_score = scan_prompt(input_scanners, prompt)
    # if not all(list(results_valid.values())[1:]):
    #     print('Encountered unsafe prompt')
    #     print(f'{prompt=}\n{results_score=}\n')
    #     raise ValueError('Unsafe prompt')
    # return sanitized_prompt


def sanitize_output(sanitized_prompt: str, response_text: str):
    """Scan LLM response for security vulnerabilities and sanitize."""
    return response_text
    # Only use LLM Guard when security enabled
    # if not security or skip_llm_guard:
    #     return response_text
    # sanitized_response_text, results_valid, results_score = scan_output(
    #     output_scanners, sanitized_prompt, response_text
    # )
    # if any(results_valid.values()) is False:
    #     print('Encountered unsafe output\n')
    #     print(f'{response_text=}\n{results_score=}\n')
    #     raise ValueError('Unsafe response')
    # return sanitized_response_text


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
            'open_charts': False,
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
                security=pandasAISecurity,
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
            security=pandasAISecurity,
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
        try:
            sanitized_query = sanitize_prompt(query)
        except ValueError:
            return 'Your question is deemed unsafe. Please reformulate properly and try again.'
        response = self.agent.chat(sanitized_query)
        if not isinstance(response, str):
            return response
        return sanitize_output(sanitized_query, response)

# End class Session

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
    session = next((s for s in sessions if s.token == token), None)
    if not session:
        raise Exception('Expired session. Try refreshing page')
    return session


def set_model(name: str, token: str):
    """ Change current LLM model for subsequent use

        See corresponding session method for details.
    """
    model = ModelName.openai if name == 'openai' else ModelName.bamboo
    session = get_session_by_token(token)
    session.set_model(model)
7

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
