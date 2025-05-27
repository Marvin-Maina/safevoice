import base64
import os

key = base64.urlsafe_b64encode(os.urandom(32)).decode()
print(f"Your AES encryption key:\n\n{key}")