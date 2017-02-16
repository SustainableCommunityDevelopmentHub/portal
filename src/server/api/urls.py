from django.conf.urls import url
from rest_framework.urlpatterns import format_suffix_patterns
#from api.views import Book, Raw, Books, Contributors, get_feedback_form
from api.views import Book, Books, Contributors, get_feedback_form



urlpatterns = [
    #url(r'^book/raw/(?P<id>(?:(?!\.json|\.xml|\.api|\.ris|\.raw).)*)$', Raw.as_view(), name='raw'),
    #url(r'^book/raw/(?P<id>(?:(?!\.json|\.xml|\.api|\.ris|\.raw).)*)\.(?P<format>[a-z0-9]+)$', Raw.as_view(), name='raw'),
    #url(r'^book/(?P<id>(.)*)$', Book.as_view(), name='book'),
    url(r'^book/(?P<id>(?:(?!\.json|\.xml|\.ris|\.raw).)*)$', Book.as_view(), name='book'),
    url(r'^book/(?P<id>(?:(?!\.json|\.xml|\.ris|\.raw).)*)\.(?P<format>[a-z0-9]+)$', Book.as_view(), name='book'),
    # this matches urls with &,.='_- spaces and characters.
    # Param group will match up until but not including .json, .api, or .xml
    url(r'^books/(?P<params>.*)[/]?$', Books.as_view(), name='books'),
    url(r'^contributors[/]?$', Contributors.as_view(), name='contributors'),
    url(r'^send-email[/]?$', get_feedback_form, name='send-email'),
]
