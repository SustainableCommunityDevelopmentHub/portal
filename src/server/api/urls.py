from django.conf.urls import url
from rest_framework.urlpatterns import format_suffix_patterns
from api.views import Book, Books, Contributors, get_feedback_form

urlpatterns = [
    url(r'^book/(?P<id>(?:(?!.json|.xml|.api).)*)$', Book.as_view(), name='book'),
    # this matches urls with &,.='_- spaces and characters.
    # Param group will match up until but not including .json, .api, or .xml
    url(r'^books/(?P<params>(?:(?!.json|.api|.xml)[\w+\s+=:/&\._\'\-,])*)$', Books.as_view(), name='books'),
    url(r'^contributors[/]?$', Contributors.as_view(), name='contributors'),
    url(r'^send-email[/]?$', get_feedback_form, name='send-email'),
]

urlpatterns = format_suffix_patterns(urlpatterns)