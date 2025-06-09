from django.core.mail import send_mail

def send_admin_status_email(email, is_approved):
    subject = "SafeVoice Admin Application Update"
    if is_approved:
        message = " Congrats! You've been approved as an admin on SafeVoice. You can now log in and start reviewing reports."
    else:
        message = " Unfortunately, your request to become an admin on SafeVoice was not approved. Feel free to reach out for feedback."

    send_mail(
        subject,
        message,
        'no-reply@safevoice.com',  # or use DEFAULT_FROM_EMAIL
        [email],
        fail_silently=False,
    )
