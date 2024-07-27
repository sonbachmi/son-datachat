from fastapi.testclient import TestClient

from server import app

client = TestClient(app)


def test_upload():
    files = [
        ('files', open('data/titanic.csv', 'rb')),
        ('files', open('data/titanic.xlsx', 'rb')),
    ]

    response = client.post(
        '/files',
        files=files,
    )
    # print (vars(response.request.headers))
    print(response.content)
    assert response.status_code < 300
