d:
cd \Code\son-datachat
call .venv\Scripts\activate.bat
@echo Launching DataChat Fastapi server
call python launch_server.py
rem call uvicorn server:api --port=8001