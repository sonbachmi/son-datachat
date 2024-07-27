import os
import random
import re
import time

import pandas as pd
import streamlit as st

from main import create_session, set_data, get_chat_response

st.set_page_config(
    page_title="Son's CS App",
    page_icon='👋',
    layout='wide',
    menu_items={'About': "# Son's CS App"},
)

with open('./assets/app.css') as f:
    css = f.read()
st.html(f'<style>{css}</style>')


# Streamed response emulator
def response_generator(answer):
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


# st.markdown('# Main page 🎈')
st.sidebar.markdown('# Settings 🎈')

st.title("Son's CS App")

llm = st.sidebar.selectbox('Use LLM', ['BambooLLM', 'OpenAI'], index=1)


if 'token' not in st.session_state:
    st.session_state.token = create_session(True)

token = st.session_state.token


@st.cache_data(hash_funcs={'io.BytesIO': lambda f: f.name + len(f.getvalue())})
def get_data(f):
    extension = os.path.splitext(f.name)[1][1:]
    df = pd.read_csv(f) if extension == 'csv' else pd.read_excel(f)
    return df


num_files = len(st.session_state.files) if 'files' in st.session_state else 0

with st.expander('**Data Source**', icon=':material/database:', expanded=True):
    st.subheader('📂 Input data')
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
        one_file = num_files == 1
        selected_index = (
            0
            if one_file
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
            f'Take number of rows from total {rows}', 1, rows, value=rows, step=10
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
        set_data(df, token)


def write_response(answer):
    if isinstance(answer, str):
        # if answer.lower().endswith('.png') or answer.lower().endswith('.jpg'):
        if re.search(r'\.(png|jpe?g)$', answer, re.IGNORECASE):
            return st.image(answer)
        return st.write(response_generator(answer))
    return st.write(answer)


with st.expander('**Conversation**', icon=':material/chat:', expanded=True):
    if not num_files:
        st.warning('Please select data source first.')
    else:
        # st.subheader('Chat')
        # st.success('Ask your AI assistant for help on the selected data source.')
        # with st.chat_message('ai'):
        #     st.write('Hello 👋 How can I help you on this?')
        # prompt = st.chat_input('Say something')
        # if prompt:
        #     st.write(f'User has sent the following prompt: {prompt}')

        # Initialize chat history
        if 'messages' not in st.session_state:
            st.session_state.messages = []

        # Display message list
        messages = st.container()
        # Display chat messages from history on app rerun
        for message in st.session_state.messages:
            with messages.chat_message(message['role']):
                st.markdown(message['content'])
        # Add last assistant response in queue to display and history
        if 'last_answer' in st.session_state:
            last_answer = st.session_state.last_answer
            del st.session_state.last_answer
            st.session_state.messages.append(
                {'role': 'assistant', 'content': last_answer}
            )
            with messages.chat_message('assistant'):
                print('Answer', last_answer, type(last_answer))
                write_response(last_answer)
        if 'submitting' not in st.session_state:
            st.session_state.submitting = False

        def on_submit():
            query = st.session_state.query
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

        # React to user input
        prompt = st.chat_input(
            'Ask about the data source',
            key='query',
            disabled=st.session_state.submitting,
            on_submit=on_submit,
        )
