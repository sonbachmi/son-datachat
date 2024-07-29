# Son's Data Chat App
### Solution to technical challenge from Cyber Sierra
#### Author: Son Nguyen <son@bachmi.com>, Senior Fullstack Engineer applicant


## Data Chat Engine

`main.py` is the core business module of the app, using **PandasAI** with **OpenAI** LLM support out of the box, and its own model **BambooLLM**.

## Streamlit App

`App.py` (and another sample content page) is a frontend app built with **Streamlit** to input data by uploading files, selecting scope for context and conducting a conversation with the engine
as required by the assigment. Response formats of text, `DataFrame` and images are supported. A simple _About_ page is also included.

A working copy is already deployed here:

[https://son-datachat.streamlit.app](https://son-datachat.streamlit.app)


## Fullstack App
The _Streamlit_ app serves the purpose for this simple application, but offers limited control over the styling and flow. In a real production scenario, 
a fullstack server-client application may be advised for full-blown usage. So as an alternative solution for demonstration purpose, I've also developed
separate apps for the two tiers:

### API Server

`server.py` is a **Fastapi** server connecting with the engine and exposing functions as public REST API. A working copy is already deployed here:

[https://son-datachat-api.bachmi.com/docs](https://son-datachat-api.bachmi.com/docs)

To run the server locally:
- Create and activate your virtual env
- Create `.env` file from `.env.example` (replacing the existing file as it is used for production), modify if desired
- `pip install -r requirents.txt`
- `fastapi dev server.py`

### Frontend Client

Inside `frontend` is a modern **React Typescript** application acting as a client UI to connect with the engine via the REST API. The flow is similar to the _Streamlit_ app.
Response formats of text, `DataFrame` and images are supported. Mobile view is minimally supported.

A working copy is already deployed here, which connects to the hosted API server:

[https://son-datachat.bachmi.com](https://son-datachat.bachmi.com)

To run the app locally (requiring **Node.js**)

- `cd frontend`
- Create `.env` file from `.env.example`, modify if desired
- `npm install`
- `npm run dev`

To provide API for the app, you also need to run a local version of the _Fastapi_ server as mentioned above. 
Or you can just use the existing public server by changing the URL in the `.env`, or copy from `env.production`.

Feel free to review the running demos and the source code. Documentation is made where useful in the code to help follow my thought process while developing.
The `git` history may also help on that.

## Tests

Unit tests for all Python apps are in the `tests` folder; run with `pytest` Make sure the tests run in the project root directory, and a local
server is not running (to avoid conflict with the server created by the tests.)

