from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated  
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from .models import User
from .serializers import RegisterSerializer,  UserSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
   

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        
        if user:
           token, _ = Token.objects.get_or_create(user=user)
           return Response({
               "token": token.key,
                "user": {
                     "username": user.username,
                     "role": user.role,
                     "user_type": user.user_type
                }
           })
        return 