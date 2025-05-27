from django.core.exceptions import ValidationError
from decouple import config

def validate_upload_file(file):
    ext = file.name.split('.')[-1].lower()
    size_mb