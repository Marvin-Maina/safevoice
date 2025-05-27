from io import BytesIO
from django.template.loader import get_template
from xthml2pdf import pisa

def render_to_pdf(template_src, context_dict={}):
    template = get_template(template_src)
    html = template.render