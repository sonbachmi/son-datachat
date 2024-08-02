"""
Streamlit app to serve frontend client to connect with the core LLM engine

Usage: run with streamlit, no need for runtime API
"""
import os
import random
import re
import time

import pandas as pd
import streamlit as st

from main import create_session, set_model, set_data, get_chat_response
from server import render_image

st.set_page_config(
    page_title="Son's Data Chat",
    page_icon='assets/favicon-32x32.png',
    layout='wide',
    menu_items={'About': '### Data Chat Challenge Solution'},
)

# Inject custom CSS
with open('./assets/app.css') as f:
    css = f.read()
st.html(f'<style>{css}</style>')

# Display settings panel in sidebar
st.sidebar.image('assets/logo.png')
st.sidebar.markdown('## Settings')

st.title("Son's Data Chat")


def response_generator(answer):
    '''Streamed response emulator with animated typing effect, used by UI render'''
    answer = str(answer)
    # resp = random.choice(
    #     [
    #         'Hello there! How can I assist you today?',
    #         'Hi, human! Is there anything I can help you with?',
    #         'Do you need help?',
    #     ]
    # )
    words = answer.split()
    word_count = len(words)
    for word in words:
        yield word + ' '
        time.sleep(0.08 if word_count < 50 else word_count / 100000)
    time.sleep(1)
    yield ''


# Maintain session token for stateful connection with core module
if 'token' not in st.session_state:
    st.session_state.token = create_session(use_streamlit=True)
token = st.session_state.token


def on_model_change():
    '''Handle model selection by selectbox.'''
    model = st.session_state.get('model', 'openai')
    set_model(model, token)
    print('Switched model to:', model)
    st.toast(f'Model switched to {model}', icon=':material/check_circle:')


llm = st.sidebar.selectbox(
    'Use LLM', ['BambooLLM', 'OpenAI'], index=1, key='model', on_change=on_model_change
)


# Nice to cache the file by hashing file name and size, good for development
# In production or in case of open file conflicts may need better hashing
# @st.cache_data(hash_funcs={'io.BytesIO': lambda f: f.name + len(f.getvalue())})
def get_data(f):
    extension = os.path.splitext(f.name)[1][1:].lower()
    df = pd.read_csv(f) if extension == 'csv' else pd.read_excel(f)
    return df

# Data Source panel
with st.expander('**Data Source**', icon=':material/database:', expanded=True):
    st.subheader('📂 Input data')
    # Upload file UI
    files = st.file_uploader(
        'Upload one or more data files (CSV/XLSX)',
        accept_multiple_files=True,
        type=['csv', 'xlsx'],
        key='files',
    )
    if files:
        st.divider()
        st.subheader('✅ Select data')
        num_files = len(files)
        # If uploaded more than 1 file, display selectbox to select file
        selected_index = (
            0
            if num_files == 1
            else st.selectbox(
                'Select file',
                range(num_files),
                index=num_files - 1,
                format_func=lambda i: files[i].name,
            )
        )
        selected_file = files[selected_index]
        with st.spinner('Reading data...'):
            try:
                df = get_data(selected_file)
            except (ValueError, UnicodeDecodeError):
                st.exception(
                    'Cannot read data. Make sure you upload a valid CSV or XLSX file.'
                )
        rows = len(df.index)
        nrows = st.number_input(
            f'Limit number of rows from total {rows}', 1, rows, value=rows, step=10
        )
        df = df.head(nrows)
        show_raw = st.toggle('Show raw data')
        if show_raw:
            st.caption(
                f'Raw data contains total {rows} rows'
                if nrows == rows
                else f'Selected data contains first {nrows} rows only'
            )
            st.dataframe(df, hide_index=True)
        # Submit data selection to core engine
        set_data([df], token)


def write_response(answer, fresh=False):
    '''Render LLM response based on format.'''
    if isinstance(answer, str):
        # if answer.lower().endswith('.png') or answer.lower().endswith('.jpg'):
        if re.search(r'\.(png|jpe?g)$', answer, re.IGNORECASE):
            return st.image(answer)
        return st.write(response_generator(answer) if fresh else answer)
    return st.write(answer)

# Conversation panel
with st.expander('**Conversation**', icon=':material/chat:', expanded=True):
    if not len(st.session_state.get('files', [])) :
        st.warning('Please select data source first.')
    else:
        # Initialize message list state
        if 'messages' not in st.session_state:
            st.session_state.messages = []
        messages = st.container()

        # Display message list
        # Retrieve message history from state
        for message in st.session_state.messages:
            with messages.chat_message(message['role']):
                if message['role'] == 'user':
                    st.write(message['content'])
                else:
                    write_response(message['content'])
        # Retrieve last LLM response from queue to display and store to history
        if 'last_answer' in st.session_state:
            last_answer = st.session_state.last_answer
            del st.session_state.last_answer
            with messages.chat_message('assistant'):
                print('Answer', last_answer, type(last_answer))
                render = write_response(last_answer, fresh=True)
                st.session_state.messages.append(
                    {'role': 'assistant', 'content': last_answer}
                )
        if 'submitting' not in st.session_state:
            st.session_state.submitting = False

        def on_submit():
            ''' Handle user prompt submission.

                - Send query to core engine
                - Receive response and store in queue for next rerun
            '''
            query = st.session_state.get('query')
            if query:
                print('Submitting query:', query)
                st.session_state.messages.append({'role': 'user', 'content': query})
                st.session_state.submitting = True
                messages.chat_message('user').markdown(query)
                with messages.chat_message('assistant'):
                    st.image('assets/typing.gif')
                response = get_chat_response(query, token)
                # Save query response to queue for processing at next rerun
                st.session_state.last_answer = response
                st.session_state.submitting = False

        # Display prompt input
        prompt = st.chat_input(
            'Ask about the data source',
            key='query',
            disabled=st.session_state.submitting,
            on_submit=on_submit,
        )
