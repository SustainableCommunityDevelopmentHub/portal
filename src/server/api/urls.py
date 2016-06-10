from django.conf.urls import url
from rest_framework.urlpatterns import format_suffix_patterns
from api.views import Book, Raw, Books, Contributors

urlpatterns = [
    url(r'^book/(?!raw/)(?P<id>(?:(?!.json|.xml|.api).)*)$', Book.as_view(), name='book'),
    url(r'^book/raw/(?P<id>(?:(?!.json|.xml|.api|.ris).)*)$', Raw.as_view(), name='raw'),
    # this matches urls with &,.='_- spaces and characters.
    # Param group will match up until but not including .json, .api, or .xml
    url(r'^books/(?P<params>(?:(?!.json|.api|.xml).)*?)[/]?$', Books.as_view(), name='books'),
    url(r'^contributors[/]?$', Contributors.as_view(), name='contributors'),
]

urlpatterns = format_suffix_patterns(urlpatterns)