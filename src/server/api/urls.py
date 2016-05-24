from django.conf.urls import url
from rest_framework.urlpatterns import format_suffix_patterns
from api.views import Book, Books, Contributors, MyTest

urlpatterns = [
    url(r'^book/(?P<id>.*)[/]?$', Book.as_view(), name='book'),
    url(r'^books/(?P<params>.*)$', Books.as_view(), name='books'),
    url(r'^contributors[/]?$', Contributors.as_view(), name='contributors'),
    url(r'^test/', MyTest.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)