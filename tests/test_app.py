from streamlit.testing.v1 import AppTest


def test_file_uploader():
    """
    File upload widget must initially be empty
    """
    at = AppTest.from_file('App.py').run()
    uploader = at.get('file_uploader')[0]
    # uploader.run()
    # at.button[0].click().run()
    files = uploader.value
    assert len(files) == 0
