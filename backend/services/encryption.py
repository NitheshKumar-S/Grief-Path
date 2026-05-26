from cryptography.fernet import Fernet
from config import settings
import base64

# Derive a valid Fernet key from the env value
key = settings.encryption_key.encode()
if len(key) < 32:
    key = key.ljust(32, b'0')
fernet_key = base64.urlsafe_b64encode(key[:32])
cipher = Fernet(fernet_key)

def encrypt(text: str) -> str:
    return cipher.encrypt(text.encode()).decode()

def decrypt(token: str) -> str:
    return cipher.decrypt(token.encode()).decode()
