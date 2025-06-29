from django.core.exceptions import ValidationError
from decouple import config

def validate_upload_file(file):
    ext = file.name.split('.')[-1].lower()
    size_mb = file.size / (1024 * 1024)
    
    allowed_images = config("ALLOWED_IMAGE_TYPES", defualt='jpeg.jpeg,png').split(',')
    allowed_videos = config('ALLOWED_VIDEO_TYPES', default='mp4,mov,avi').split(',')
    allowed_files = config('ALLOWED_PDF_TYPES', default='pdf').split(',')
    
    max_image_size = float(config('MAX_IMAGE_SIZE_MB', default=5))
    max_video_size = float(config('MAX_VIDEO_SIZE_MB', default=20))
    max_pdf_size = float(config('MAX_PDF_SIZE_MB', default=10))
    
    if ext in allowed_images:
        if size_mb > max_image_size: