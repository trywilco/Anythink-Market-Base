from django.urls import re_path

from .views import (
    LoginAPIView, RegistrationAPIView, UserRetrieveUpdateAPIView
)

urlpatterns = [
    re_path(r'^user/?$', UserRetrieveUpdateAPIView.as_view()),
    re_path(r'^users/?$', RegistrationAPIView.as_view()),
    re_path(r'^users/login/?$', LoginAPIView.as_view()),
]
