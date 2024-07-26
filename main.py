import os
import pandas as pd

from pandasai import SmartDataframe, Agent, skill
from pandasai.helpers import get_openai_callback
from pandasai.llm import OpenAI
from pandasai.responses.streamlit_response import StreamlitResponse

from dotenv import load_dotenv

load_dotenv()

os.environ['PANDASAI_API_KEY'] = os.getenv('PANDASAI_API_KEY')

llm = OpenAI(streaming=True)
config = {
    'llm': llm,
    # "verbose": True,
    'response_parser': StreamlitResponse,
}


def test_with_countries():
    sales_by_country = pd.DataFrame(
        {
            'country': [
                'United States',
                'United Kingdom',
                'France',
                'Germany',
                'Italy',
                'Spain',
                'Canada',
                'Australia',
                'Japan',
                'China',
            ],
            'sales': [5000, 3200, 2900, 4100, 2300, 2100, 2500, 2600, 4500, 7000],
            'deals_opened': [142, 80, 70, 90, 60, 50, 40, 30, 110, 120],
            'deals_closed': [120, 70, 60, 80, 50, 40, 30, 20, 100, 110],
        }
    )
    agent = Agent(sales_by_country, config)
    response = agent.chat('Which are the top 5 countries by sales?')
    print(response)


def test_with_employees():
    @skill
    def plot_salaries(names: list[str], salaries: list[int]):
        """
        Displays the bar chart  having name on x-axis and salaries on y-axis
        Args:
            names (list[str]): Employees' names
            salaries (list[int]): Salaries
        """
        # plot bars
        import matplotlib.pyplot as plt

        plt.bar(names, salaries)
        plt.xlabel('Employee Name')
        plt.ylabel('Salary')
        plt.title('Employee Salaries')
        plt.xticks(rotation=45)

    employees_data = {
        'EmployeeID': [1, 2, 3, 4, 5],
        'Name': ['John', 'Emma', 'Liam', 'Olivia', 'William'],
        'Department': ['HR', 'Sales', 'IT', 'Marketing', 'Finance'],
    }

    salaries_data = {
        'EmployeeID': [1, 2, 3, 4, 5],
        'Salary': [5000, 6000, 4500, 7000, 5500],
    }

    employees_df = pd.DataFrame(employees_data)
    salaries_df = pd.DataFrame(salaries_data)
    agent = Agent([employees_df, salaries_df], config, memory_size=10)

    # query = "Who gets paid the most?"
    query = 'Plot the employee salaries against names'

    # Chat with the agent
    response = agent.chat(query)
    print(response)

    # Get Clarification Questions
    questions = agent.clarification_questions(query)

    for question in questions:
        print(question)

    # Explain how the chat response is generated
    response = agent.explain()
    print(response)


def get_agent(_df):
    df = pd.read_csv('data/titanic.csv', nrows=200)
    return Agent(df, config, memory_size=10)


def get_chat_response(agent, query):
    # with get_openai_callback() as cb:
    #     response = agent.chat(query)
    #     print("Result:", cb)
    response = agent.chat(query)
    return response


def test_with_titanic():
    rows = 100
    df = pd.read_excel('data/titanic.xlsx', nrows=rows)
    agent = Agent(df, config)
    response = agent.chat('How many survivors are there')
    print(response)


# test_with_titanic()
