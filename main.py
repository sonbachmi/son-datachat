import os
import pandas as pd

from pandasai import SmartDataframe, Agent
from pandasai.llm import OpenAI
# from pandasai.helpers.openai_info import get_openai_callback

from dotenv import load_dotenv

load_dotenv()

os.environ["PANDASAI_API_KEY"] = os.getenv("PANDASAI_API_KEY")

llm = OpenAI()
config = {
    "llm": llm,
    "conversational": False}


# with get_openai_callback() as cb:
#     response = df.chat("Calculate the sum of the gdp of north american countries")
#
#     print("Response:", response)
#     print("Result", cb)

def test_with_countries():
    # Sample DataFrame
    sales_by_country = pd.DataFrame({
        "country": ["United States", "United Kingdom", "France", "Germany", "Italy", "Spain", "Canada", "Australia",
                    "Japan", "China"],
        "sales": [5000, 3200, 2900, 4100, 2300, 2100, 2500, 2600, 4500, 7000],
        "deals_opened": [142, 80, 70, 90, 60, 50, 40, 30, 110, 120],
        "deals_closed": [120, 70, 60, 80, 50, 40, 30, 20, 100, 110]
    })
    agent = Agent(sales_by_country, config)
    response = agent.chat('Which are the top 5 countries by sales?')
    print(response)


# def plot_salaries(merged_df: pd.DataFrame):
#     """
#     Displays the bar chart having name on x-axis and salaries on y-axis using streamlit
#     """
#     import matplotlib.pyplot as plt
#
#     plt.bar(merged_df["Name"], merged_df["Salary"])
#     plt.xlabel("Employee Name")
#     plt.ylabel("Salary")
#     plt.title("Employee Salaries")
#     plt.xticks(rotation=45)
#     plt.savefig("temp_chart.png")
#     plt.close()


def test_with_employees():
    employees_data = {
        "EmployeeID": [1, 2, 3, 4, 5],
        "Name": ["John", "Emma", "Liam", "Olivia", "William"],
        "Department": ["HR", "Sales", "IT", "Marketing", "Finance"],
    }

    salaries_data = {
        "EmployeeID": [1, 2, 3, 4, 5],
        "Salary": [5000, 6000, 4500, 7000, 5500],
    }

    employees_df = pd.DataFrame(employees_data)
    salaries_df = pd.DataFrame(salaries_data)
    agent = Agent([employees_df, salaries_df], config, memory_size=10)
    # agent.add_skills(plot_salaries)

    query = "Who gets paid the most?"

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


test_with_employees()