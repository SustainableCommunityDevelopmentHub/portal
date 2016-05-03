from django.conf.urls import url
from api.views import MyView

urlpatterns = [
    url(r'^book/', Book.as_view()),
]