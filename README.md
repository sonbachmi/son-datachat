# Son's Data Chat App
### Solution to technical challenge from Cyber Sierra
#### Author: Son Nguyen <son@bachmi.com>, Senior Fullstack Engineer applicant


## Data Chat Engine

`main.py` is the core business module of the app, using the **PandasAI** library with **OpenAI** LLM support out of the box, and its own model **BambooLLM**.
The module is meant to be imported statically and serves as the backend providing LLM functions to connecting clients.

## Streamlit App

`App.py` is a frontend app built with **Streamlit** to input data by uploading files, selecting scope for context and conducting a conversation with the engine
as required by the assigment. Response formats of text, `DataFrame` and images are supported. A sample _About_ page is also included.

A working copy is already deployed here:

[https://son-datachat.streamlit.app](https://son-datachat.streamlit.app)

To run the app locally:

- Set up Python environment and install dependencies (see the 3 first steps to run the _API server_ below)
- `streamlit run App.py`

The app connects statically to the engine so no need for a runtime API.

## Fullstack App
The _Streamlit_ app serves the purpose for this simple application, but offers limited control over the styling and flow.
The tight coupling of the backend with the frontend client as typical in a _Streamlit_ app makes it hard to scale.
In a real production scenario, a fullstack server-client application may be advised for full-blown usage.
So as an alternative solution for demonstration purpose, I've also built separate cross-platform apps for the two tiers:

### API Server

`server.py` is a **FastAPI** server connecting with the engine and exposing functions as public REST API. A working copy is already deployed here:

[https://son-datachat-api.bachmi.com/docs](https://son-datachat-api.bachmi.com/docs)

To run the server locally:
- Create and activate your Python virtual env in the project root folder
- Create `.env` file from `.env.example` (replacing the existing file as it is used for production), modify if desired
- `pip install -r requirements.txt`
- `fastapi dev server.py`

### Frontend Client

Inside `frontend` folder is a modern **React TypeScript** application serving a client UI to connect with the engine via the REST API. The flow is similar to the _Streamlit_ app.
Response formats of text, `DataFrame` and images are supported. Messages in history can be reused as new prompt by clicking on them. Mobile view is minimally supported.

A working copy is already deployed here, which connects to the hosted API server:

[https://son-datachat.bachmi.com](https://son-datachat.bachmi.com)

To run the app locally (requiring **Node.js**)

- `cd frontend`
- Create `.env` file from `.env.example`, modify if desired
- `npm install`
- `npm run dev`

To provide API for the app, you also need to run a local version of the _FastAPI_ server as mentioned above. 
Or you can just use the existing public server by changing the URL in the `.env`, or copy from `env.production`.

Feel free to review the running demos and the source code. Documentation is made where useful in the code to help follow my thought process while developing.
The `git` history may also help on observing project progression.

## Security

This assigment is assumed to focus on LLM security. A few measures are implemented to improve security on both input and output
using the **LLM Guard** library for demonstration purpose:

- Input (prompt) from user is scanned for toxic content, sensible data, malicious injection and other unsafe content, then sanitized
- Output (response) from LLM is also scanned and sanitized before reaching user

Another measure specific to _PandasAI_ is using the _Advanced Security Agent_ to detect malicious code generation.

Those measures can provide a fair security layer to protect general applications, but may add some latency to response time;
and the _Advanced Security Agent_ feature may potentially require a license. 
So for this project, they are turned off by default by a switch in source code.
In real production use, when it is preferably enabled, it is important to implement the optimal configuration, possibly adding
more security measures provided by other libraries to the layer.

## Tests

Unit tests for all Python apps are in the `tests` folder.
Make sure the tests run in the project root directory, with no local server open.

~~~bash
python -m pytest tests/
~~~


