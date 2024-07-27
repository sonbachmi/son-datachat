import pandas as pd

from main import create_session, set_data, get_chat_response

sales_by_country = pd.DataFrame({
    "country": ["United States", "United Kingdom", "France", "Germany", "Italy", "Spain", "Canada", "Australia",
                "Japan", "China"],
    "sales": [5000, 3200, 2900, 4100, 2300, 2100, 2500, 2600, 4500, 7000],
    "deals_opened": [142, 80, 70, 90, 60, 50, 40, 30, 110, 120],
    "deals_closed": [120, 70, 60, 80, 50, 40, 30, 20, 100, 110]
})


def test_flow():
    token = create_session()
    assert type(token) is str and len(token) == 8
    set_data([sales_by_country], token)
    query = 'Which are the top 5 countries by sales?'
    response = get_chat_response(query, token)
    assert response is not None
    print(response)


def test_flow_with_streamlit():
    token = create_session(True)
    assert type(token) is str and len(token) == 8
    set_data([sales_by_country], token)
    query = 'Plot sales by country'
    response = get_chat_response(query, token)
    assert response is not None
    print(response)
