# Son's Data Chat Frontend App

**React Typescript** application acting as a client UI to connect with the LLM engine. The flow is similar to the _Streamlit_ app.

A working copy is already deployed here:

[https://son-datachat.bachmi,com](https://son-datachat.bachmi.com)

To run the app locally:

- Make sure **Node.js** is installed
- `cd frontend`7
- Create `.env` file from `.env.example`, modify if desired
- `npm install`
- `npm run dev`

To provide API for the app, you also need to run a local version of the **FastAPI** server as mentioned in the main `README`.
Or you can just use the existing public server by changing the URL in the `.env`, or copy from `env.production`.