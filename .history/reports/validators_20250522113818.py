from django.core.exceptions import ValidationError
from decouple import config

def validate_upload_file(file):
    ext = 