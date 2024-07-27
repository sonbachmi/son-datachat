import pytest
from fastapi.testclient import TestClient

from server import api

client = TestClient(api)


@pytest.fixture
def session_token():
    response = client.post('/session')
    yield response.json()['token']


@pytest.mark.skip
def test_upload(session_token: str):
    files = [
        ('files', open('data/titanic.csv', 'rb')),
        ('files', open('data/titanic.xlsx', 'rb')),
    ]

    response = client.post(
        f'/data/input?token={session_token}',
        files=files,
    )
    assert response.status_code < 300
    resp = response.json()
    rows = resp['rows']
    assert len(rows) == 2


def test_conversation(session_token: str):
    files = [
        ('files', open('data/titanic.csv', 'rb')),
        ('files', open('data/titanic.xlsx', 'rb')),
    ]

    response = client.post(
        f'/data/input?token={session_token}',
        files=files,
    )
    assert response.status_code < 300
    assert len(response.json()['rows']) == 2
    assert response.json()['selectedIndex'] == 0

    # Test data selection
    response = client.post(
        f'/data/select?index=1&head=111&token={session_token}')
    assert response.status_code < 300
    assert response.json() == {'selectedIndex': 1}

    query = 'How many passengers survived?'
    response = client.post(
        f'/query?token={session_token}',
        json={'query': query})
    assert response.status_code < 300
    resp = response.json()
    print(resp)
    answer = resp['answer']
    assert answer is not None
    assert resp['type'] is not None
    print(answer)
