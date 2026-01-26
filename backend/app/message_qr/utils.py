import secrets

def generate_message_token():
    return secrets.token_urlsafe(8)