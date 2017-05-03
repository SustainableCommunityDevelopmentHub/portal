import json

from django.test import TestCase, RequestFactory
from rest_framework.test import APIRequestFactory, APITestCase
from rest_framework import status
from lxml import etree

from api.views import Book, Books, Contributors
from api.renderers import RawRenderer, JSONDCRenderer, XMLDCRenderer, RISRenderer
from rest_framework.renderers import JSONRenderer
from . import es_functions


class APITests(APITestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.maxDiff = None

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

    def test_book_raw(self):
        book = Book.as_view()
        test_id = 'gri_9921975010001551'
        request = self.factory.get('/api/book/{}.raw'.format(test_id))
        response = book(request, test_id, format='raw')
        response.render()
        self.assertEqual(response.data['_id'], test_id)

    def test_bad_book_id_raw(self):
        book = Book.as_view()
        test_id = 'bad_book_id'
        request = self.factory.get('/api/book/{}.raw'.format(test_id))
        response = book(request, test_id, format='raw')
        self.assertFalse(response.data['found'])
        self.assertEqual(response.data['_id'], test_id)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_book_json(self):
        book = Book.as_view()
        test_id = 'gri_9921975010001551'
        book_data = {"@context": {"dcterms": "http://purl.org/dc/terms/", "dc": "http://purl.org/dc/elements/1.1/"}, "dc:record": {"dc:publisher": "[London : J. Murray", "dcterms:issued": "1900", "dc:identifier": "https://www.archive.org/details/murrayshandbooke00john", "dc:description": ["Cover title.", "Spine title: Hand-book Essex, Suffolk, Norfolk, Cambridgeshire."], "dcterms:alternative": "Hand-book Essex, Suffolk, Norfolk, Cambridgeshire.", "dc:title": "Murray's hand-book eastern counties.", "dcterms:isPartOf": "Murray's English handbooks", "dc:language": "English", "dc:creator": "John Murray (Firm)", "dc:type": "Text"}, "@id": "http://portal.getty.edu/books/gri_9921975010001551"}
        request = self.factory.get('/api/book/{}.json'.format(test_id))
        response = book(request, test_id, format='json')
        response.render()
        self.assertEqual(json.loads(response.content.decode()), book_data)

    def test_book_xml(self):
        book = Book.as_view()
        test_id = 'gri_9921975010001551'
        request = self.factory.get('/api/book/{}.xml'.format(test_id))
        response = book(request, test_id, format='xml')
        response.render()
        root = etree.fromstring(response.content)
        nsmap = root.nsmap
        self.assertEqual(root.xpath('dc:title', namespaces=nsmap)[0].text, 'Murray\'s hand-book eastern counties.')
        self.assertEqual(root.xpath('dcterms:alternative', namespaces=nsmap)[0].text, 'Hand-book Essex, Suffolk, Norfolk, Cambridgeshire.')
        self.assertEqual(len(root.xpath('dc:description', namespaces=nsmap)), 2)

    def test_book_ris(self):
        book = Book.as_view()
        test_id = 'gri_9921975010001551'
        request = self.factory.get('/api/book/{}.ris'.format(test_id))
        response = book(request, test_id, format='ris')
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

    def test_ampersands_in_facets(self):
        books = Books.as_view()
        query_params = 'from=0&size=2&sort=relevance&creator=Harper & Brothers'
        request = self.factory.get(query_params)
        response = books(request, query_params)
        self.assertEqual(response.data[0]['hits']['total'], 1)



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

