# Son's Data Chat Frontend App

**React Typescript** application acting as a client UI to connect with the LLM engine. The flow is similar to the _Streamlit_ app.

A working copy is already deployed here, which connects to the API server above:

[https://son-datachat.com](https://son-datachat-api.bachmi.com/docs)

To run the app locally:

- Make sure **Node.js** is installed
- `cd frontend`
- Create .`env` file from `.env.example`, modify if desired
- `npm install`
- `npm run dev`

To provide API for the app, you also need to run a local version of the **Fastapi** server as mentioned in the main `README`.