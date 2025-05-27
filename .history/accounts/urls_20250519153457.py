from .views import *
from django.urls import path

 urlpatterns = [
    path('', index, name='index'),
    path('login/', login_view, name='login'),
    path('register/', register_view, name='register'),
    path('logout/', logout_view, name='logout'),
    path('profile/', profile_view, name='profile'),
    path('update_profile/', update_profile_view, name='update_profile'),
 ]
 
