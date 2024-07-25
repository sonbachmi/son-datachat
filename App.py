import hashlib
import os
import streamlit as st
import numpy as np
import pandas as pd

st.set_page_config(
    page_title="Son's CS App",
    page_icon="👋",
    layout="wide",
    menu_items={
        'About': "# Son's CS App. Solution to *Cyber Sierra*'s challenge"
    }
)

# st.markdown("# Main page 🎈")
st.sidebar.markdown("# Settings 🎈")

st.title("Son's CS App")
# st.header('Data app')

llm = st.sidebar.selectbox(
    'Use LLM',
    ['BambooLLM', 'OpenAI'],
    index=1)


@st.cache_data(hash_funcs={'io.BytesIO': lambda f: f.name + len(f.getvalue())})
def get_data(f):
    extension = os.path.splitext(f.name)[1][1:]
    df = pd.read_csv(f) if extension == 'csv' else pd.read_excel(f)
    return df


with st.expander("**Data Source**", icon=":material/database:", expanded=True):
    st.subheader('📂 Input data')
    files = st.file_uploader("Upload one or more data files (CSV/XLSX)", accept_multiple_files=True,
                             type=['csv', 'xlsx'])
    if files:
        st.divider()
        st.subheader('✅ Select data')
        num_files = len(files)
        one_file = num_files == 1
        selected_index = 0 if one_file else st.selectbox(
            'Select file', range(num_files),
            index=num_files - 1,
            format_func=lambda i: files[i].name)
        selected_file = files[selected_index]
        with st.spinner('Reading data...'):
            try:
                df = get_data(selected_file)
            except (ValueError, UnicodeDecodeError, Exception) as e:
                st.exception('Cannot read data. Make sure you upload a valid CSV or XLSX file.')
                st.exception(e)
        rows = len(df.index)
        nrows = st.number_input(f"Take number of rows from total {rows}", 1, rows, value=rows, step=10)
        df = df.head(nrows)
        show_raw = st.toggle('Show raw data')
        if show_raw:
            st.caption(
                f'Raw data contains total {rows} rows' if nrows == rows else f'Selected data contains first {nrows} rows only')
            st.dataframe(df, hide_index=True)
