from django.shortcuts import render 
from django.http import HttpResponse

def index(request):
    return HttpResponse(request, "the first intro to safevoice")
# Create your views here.
