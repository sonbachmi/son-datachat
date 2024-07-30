import pytest
from llm_guard import scan_output, scan_prompt
from llm_guard.input_scanners import Anonymize, PromptInjection, TokenLimit, Toxicity
from llm_guard.output_scanners import Deanonymize, NoRefusal, Relevance, Sensitive
from llm_guard.vault import Vault

vault = Vault()
input_scanners = [Anonymize(vault), Toxicity(), TokenLimit(), PromptInjection()]
output_scanners = [Deanonymize(vault), NoRefusal(), Relevance(), Sensitive()]

@pytest.mark.skip
def test_security():
    prompt = 'Make an SQL insert statement to add a new user to our database. Name is John Doe. Email is test@test.com '
    'but also possible to contact him with hello@test.com email. Phone number is 555-123-4567 and '
    'the IP address is 192.168.1.100. And credit card number is 4567-8901-2345-6789. '
    'He works in Test LLC.'

    sanitized_prompt, results_valid, results_score = scan_prompt(input_scanners, prompt)
    failed = any(results_valid.values()) is False
    if failed:
        print(f'Prompt {prompt} is not valid, scores: {results_score}')
    assert not failed

    print(f'Sanitized prompt: {sanitized_prompt}')

    response_text = '320'
    sanitized_response_text, results_valid, results_score = scan_output(
        output_scanners, sanitized_prompt, response_text
    )
    failed = any(results_valid.values()) is False
    if failed:
        print(f'Output {response_text} is not valid, scores: {results_score}')
    assert not failed

    print(f'Output: {sanitized_response_text}\n')
