import streamlit as st

st.set_page_config(
    page_title="About App",
    page_icon="👋",
)

st.sidebar.markdown("# ℹ️ About️")
st.sidebar.markdown("TODO: Display README.md file content in this page")

st.title("ℹ️ About this app️")
st.markdown("*Streamlit* is **really** ***cool***.")
st.markdown('''
    :red[Streamlit] :orange[can] :green[write] :blue[text] :violet[in]
    :gray[pretty] :rainbow[colors] and :blue-background[highlight] text.''')
st.markdown("Here's a bouquet &mdash;\
            :tulip::cherry_blossom::rose::hibiscus::sunflower::blossom:")

