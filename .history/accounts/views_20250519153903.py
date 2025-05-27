from django.shortcuts import render 
from django.http import HttpResponse

def index(request):
    return render(request, "the first intro to safevoice")
# Create your views here.
