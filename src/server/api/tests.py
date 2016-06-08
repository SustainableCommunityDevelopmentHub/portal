from django.test import TestCase, RequestFactory
from rest_framework.test import APIRequestFactory, APITestCase
from api.views import Book, Raw, Books, Contributors
from . import es_functions
from api.renderers import RISRenderer

import json


class APITests(APITestCase):
    def setUp(self):
        self.factory = APIRequestFactory()

    def test_contributors(self):
        contributors = Contributors()
        contributors_data = [{'key': 'Gallica - Bibliothèque nationale de France', 'doc_count': 100},
                             {'key': 'Heidelberg University Library', 'doc_count': 100},
                             {'key': "Institut National d'Histoire de l'Art", 'doc_count': 99},
                             {'key': 'Getty Research Institute', 'doc_count': 84},
                             {'key': 'Metropolitan Museum of Art', 'doc_count': 44},
                             {'key': 'Universidad de Málaga', 'doc_count': 25}]
        request = self.factory.get('/api/contributors')
        response = contributors.get(request)
        self.assertEqual(response.data, contributors_data)

    def test_raw(self):
        book = Raw.as_view()
        test_id = 'gri_9921975010001551'
        request = self.factory.get('/api/book/raw/gri_9921975010001551')
        response = book(request, 'gri_9921975010001551')
        self.assertEqual(response.data['_id'], test_id)

    def test_book(self):
        book = Book.as_view()
        test_id = 'gri_9921975010001551'
        book_data = {"language":"English","creator":"John Murray (Firm)","isPartOf":"Murray's English handbooks","publisher":"J. Murray","alternative":"Hand-book Essex, Suffolk, Norfolk, Cambridgeshire.","title":"Murray's hand-book eastern counties.","description":["Cover title.","Spine title: Hand-book Essex, Suffolk, Norfolk, Cambridgeshire."],"issued":"1900","type":"Text","identifier":"https://www.archive.org/details/murrayshandbooke00john"}
        request = self.factory.get('/api/book/gri_9921975010001551')
        response = book(request, 'gri_9921975010001551')
        self.assertEqual(response.data, book_data)

    def test_ris(self):
        book = Raw.as_view()
        ris_data = "TY  - BOOK\r\nLA  - English\r\nET  - 3rd ed.\r\nPB  - J. Murray\r\nPY  - 19--]///\r\nN1  - Cover title.; Spine title: Hand-book Essex, Suffolk, Norfolk, Cambridgeshire.\r\nUR  - https://www.archive.org/details/murrayshandbooke00john\r\nTI  - Murray's hand-book eastern counties.\r\nAU  - John Murray (Firm)\r\nER  - \r\n"

        request = self.factory.get('/api/book/raw/gri_9921975010001551.ris')
        response = book(request, 'gri_9921975010001551', format='ris')
        response.render()
        self.assertIn("TY  - BOOK\r\n", (response.content).decode())
        self.assertIn("UR  - https://www.archive.org/details/murrayshandbooke00john\r\n", (response.content).decode())
        self.assertIn("TI  - Murray's hand-book eastern counties.\r\n", (response.content).decode())

    def test_search_all(self):
        books = Books.as_view()
        request = self.factory.get('/api/books/from=0&size=25')
        response = books(request, 'from=0&size=25')
        self.assertEqual(response.data[0]['hits']['total'], 452)

    def test_search(self):
        books = Books.as_view()
        request = self.factory.get(
            'q=art&from=0&size=2&sort=title_desc&date_gte=1900&date_lte=1905&language=English&adv_contributor=getty')
        response = books(request,
                         'q=art&from=0&size=2&sort=title_desc&date_gte=1900&date_lte=1905&language=English&adv_contributor=getty')
        self.assertEqual(response.data[0]['hits']['total'], 2)


class TestESHelperFunctions(TestCase):

    def test_sort_relevance(self):
        sortQuery = es_functions.create_sort_query(['relevance'])
        self.assertEqual(sortQuery, [])

    def test_pub_date_sort(self):
        sortQuery = es_functions.create_sort_query(['date_asc'])
        self.assertEqual(sortQuery, '_date_facet')
        sortQuery = es_functions.create_sort_query(['date_desc'])
        self.assertEqual(sortQuery, {'_date_facet': {'order': 'desc'}})

    def test_date_added_sort(self):
        sortQuery = es_functions.create_sort_query(['date_added'])
        self.assertEqual(sortQuery, {'_ingest_date': {'order': 'desc'}})

    def test_title_sort(self):
        sortQuery = es_functions.create_sort_query(['title_asc'])
        self.assertEqual(sortQuery, '_title_display.sort')

        sortQuery = es_functions.create_sort_query(['title_desc'])
        self.assertEqual(sortQuery, {'_title_display.sort': {'order': 'desc'}})

    def test_date_query(self):
        dateQuery = es_functions.create_date_query(['1900'], ['1905'])
        correctDateQuery = {'range': {'_date_facet': {'gte': '1900',
                                                      'lte': '1905'}}}
        self.assertEqual(dateQuery, correctDateQuery)

    def test_facet_filters(self):
        facets = ['Art', 'Exhibitions']
        filters = es_functions.create_facet_filters('subject', facets)
        correct_filters = [{'term': {'_subject_facets.raw': 'Art'}}, {'term': {'_subject_facets.raw': 'Exhibitions'}}]
        self.assertEqual(filters, {'bool': {'should': correct_filters}})

    def test_multiple_query_strings(self):
        query_terms = ['painting', 'art']
        query = es_functions.create_query_string(query_terms)
        self.assertEqual(query['query_string']['query'], 'painting art')

    def test_advanced_filters(self):
        correct_filter = [{'query_string': {'query': 'English',
                                   'minimum_should_match': '2<-1 5<75%',
                                   'fields': ['dublin_core.language.value', 'dublin_core.language.value.folded', 'dublin_core.language.value.stemmed']}}]
        advanced_filter = es_functions.create_advanced_filters('adv_language', ['English'])
        self.assertEqual(advanced_filter, correct_filter)

    def test_query_string_special_chars(self):
        query_term = ['[2^&|art!]painting+=-']
        query = es_functions.create_query_string(query_term)
        self.assertEqual(query['query_string']['query'], '\[2\^\&\|art\!\]painting\+\=\-')

