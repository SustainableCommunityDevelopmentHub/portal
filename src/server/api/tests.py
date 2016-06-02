from django.test import TestCase, RequestFactory
from rest_framework.test import APIRequestFactory
from api.views import Book, Books, Contributors

import json


class APITests(TestCase):
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

    def test_book(self):
        book = Book.as_view()
        book_data = {'_version': 1, 'found': True, '_index': 'portal', '_id': 'gri_9921975010001551', '_source': {'_grp_contributor': 'Getty Research Institute', '_date_display': '19--]', '_language': ['English'], '_edition': '3rd ed.', '_creator_facet': ['John Murray (Firm)'], '_title_display': "Murray's hand-book eastern counties.", '_ingest_date': '2015-10-19', '_grp_id': 'gri_9921975010001551', '_record_link': 'https://www.archive.org/details/murrayshandbooke00john', '_creator_display': ['John Murray (Firm)'], 'dublin_core': {'relation': [{'value': "Murray's English handbooks", 'qualifier': 'isPartOf'}], 'description': [{'value': 'Cover title.'}, {'value': 'Spine title: Hand-book Essex, Suffolk, Norfolk, Cambridgeshire.'}], 'title': [{'value': "Murray's hand-book eastern counties."}, {'value': 'Hand-book Essex, Suffolk, Norfolk, Cambridgeshire.', 'qualifier': 'alternative'}], 'publisher': [{'value': 'J. Murray'}], 'creator': [{'value': 'John Murray (Firm)'}], 'type': [{'value': 'Text', 'encoding': 'DCMI Type Vocabulary'}], 'date': [{'value': '19--]', 'qualifier': 'issued'}, {'value': '1900', 'qualifier': 'issued'}], 'identifier': [{'value': 'https://www.archive.org/details/murrayshandbooke00john', 'volume': 'Getty Research Institute digitized version (Internet Archive)', 'encoding': 'URI'}], 'language': [{'value': 'English', 'encoding': 'ISO369-2'}]}, '_date_facet': '1900'}, '_type': 'book'}

        request = self.factory.get('/api/book/gri_9921975010001551')
        response = book(request, 'gri_9921975010001551')
        self.assertEqual(response.data, book_data)

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

        search_data = [{'_index': 'portal', '_id': 'gri_9922088190001551', 'sort': ['Practical masonry : a guide to the art of stone cutting : comprising the construction, setting-out, and working of stairs, circular work, arches, niches, domes, pendentives, vaults, tracery windows, etc. : to which are added supplements relating to masonry estimating and quantity surveying, and to building stones and marbles, and a glossary of terms for the use of students, masons, and craftsmen / by William R. Purchase.'], '_source': {'_grp_contributor': 'Getty Research Institute', '_creator_display': ['Purchase, William R.'], '_creator_facet': ['Purchase, William R'], '_ingest_date': '2015-10-19', '_date_facet': '1904', '_language': ['English'], 'dublin_core': {'title': [{'value': 'Practical masonry : a guide to the art of stone cutting : comprising the construction, setting-out, and working of stairs, circular work, arches, niches, domes, pendentives, vaults, tracery windows, etc. : to which are added supplements relating to masonry estimating and quantity surveying, and to building stones and marbles, and a glossary of terms for the use of students, masons, and craftsmen / by William R. Purchase.'}], 'creator': [{'value': 'Purchase, William R.'}], 'date': [{'qualifier': 'issued', 'value': '1904'}], 'subject': [{'value': 'Masonry.', 'encoding': 'LCSH'}, {'value': 'Stone-cutting.', 'encoding': 'LCSH'}, {'value': 'TH5401 .P97', 'encoding': 'LCC'}], 'language': [{'value': 'English', 'encoding': 'ISO369-2'}], 'type': [{'value': 'Text', 'encoding': 'DCMI Type Vocabulary'}], 'identifier': [{'value': 'https://www.archive.org/details/gri_33125000664686', 'encoding': 'URI', 'volume': 'Getty Research Institute digitized version (Internet Archive)'}], 'publisher': [{'value': 'C. Lockwood and Son'}], 'format': [{'qualifier': 'extent', 'value': 'viii, 218 p. :'}]}, '_grp_id': 'gri_9922088190001551', '_date_display': '1904', '_record_link': 'https://www.archive.org/details/gri_33125000664686', '_subject_facets': ['Masonry', 'Stone-cutting'], '_title_display': 'Practical masonry : a guide to the art of stone cutting : comprising the construction, setting-out, and working of stairs, circular work, arches, niches, domes, pendentives, vaults, tracery windows, etc. : to which are added supplements relating to masonry estimating and quantity surveying, and to building stones and marbles, and a glossary of terms for the use of students, masons, and craftsmen / by William R. Purchase.', '_edition': '5th ed., enl.'}, '_type': 'book', '_score': None}, {'_index': 'portal', '_id': 'gri_9921999570001551', 'sort': ['Illustrated catalogue : paintings in the Metropolitan Museum of Art, New York.'], '_source': {'_grp_contributor': 'Getty Research Institute', '_creator_display': ['Metropolitan Museum of Art (New York, N.Y.)'], '_creator_facet': ['Metropolitan Museum of Art (New York, N.Y.)', 'Metropolitan Museum of Art (New York, N.Y.)'], '_ingest_date': '2015-10-19', '_date_facet': '1905', '_language': ['English'], 'dublin_core': {'title': [{'value': 'Illustrated catalogue : paintings in the Metropolitan Museum of Art, New York.'}, {'qualifier': 'alternative', 'value': 'Paintings in the Metropolitan Museum of Art.'}], 'creator': [{'value': 'Metropolitan Museum of Art (New York, N.Y.)'}], 'date': [{'qualifier': 'issued', 'value': '1905'}], 'subject': [{'value': 'Metropolitan Museum of Art (New York, N.Y.) -- Catalogs.', 'encoding': 'LCSH'}], 'description': [{'value': '"(From forth issue)" ; (with addenda to January, 1907, inclusive)"'}, {'value': 'Includes bibliographical references.'}], 'language': [{'value': 'English', 'encoding': 'ISO369-2'}], 'type': [{'value': 'Text', 'encoding': 'DCMI Type Vocabulary'}], 'identifier': [{'value': 'https://www.archive.org/details/illustratedcatal00metr', 'encoding': 'URI', 'volume': 'Getty Research Institute digitized version (Internet Archive)'}], 'publisher': [{'value': 'The Museum'}], 'contributor': [{'value': 'Metropolitan Museum of Art (New York, N.Y.)'}], 'format': [{'qualifier': 'extent', 'value': 'xlii, 246 p., [91] leaves of plates :'}]}, '_grp_id': 'gri_9921999570001551', '_date_display': '1905', '_contributor_display': ['Metropolitan Museum of Art (New York, N.Y.)'], '_record_link': 'https://www.archive.org/details/illustratedcatal00metr', '_subject_facets': ['Metropolitan Museum of Art (New York, N.Y.)', 'Catalogs'], '_title_display': 'Illustrated catalogue : paintings in the Metropolitan Museum of Art, New York.'}, '_type': 'book', '_score': None}]

        self.assertEqual(response.data[0]['hits']['hits'], search_data)
