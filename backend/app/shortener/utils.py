import string
import secrets
from datetime import datetime, timedelta, timezone


def generate_short_code(length: int = 6) -> str:
    chars = string.ascii_letters + string.digits
    return "".join(secrets.choice(chars) for _ in range(length))


def generate_qr_token():
    return secrets.token_urlsafe(16)


def qr_expiry():
    return datetime.now(timezone.utc) + timedelta(days=7)