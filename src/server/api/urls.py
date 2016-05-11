from django.conf.urls import url
from rest_framework.urlpatterns import format_suffix_patterns
from api.views import Book, Contributors

urlpatterns = [
    url(r'^book/(?P<id>\w+)[/]?$', Book.as_view(), name='book'),
    url(r'^contributors[/]?$', Contributors.as_view()),
    #url(r'^book/', Book.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)