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
        book_data = {"_type":"book","_index":"portal","_id":"gri_9921975010001551","_source":{"_record_link":"https://www.archive.org/details/murrayshandbooke00john","_grp_id":"gri_9921975010001551","_title_display":"Murray's hand-book eastern counties.","_date_display":"19--]","dublin_core":{"date":[{"value":"19--]","qualifier":"issued"},{"value":"1900","qualifier":"issued"}],"title":[{"value":"Murray's hand-book eastern counties."},{"value":"Hand-book Essex, Suffolk, Norfolk, Cambridgeshire.","qualifier":"alternative"}],"creator":[{"value":"John Murray (Firm)"}],"language":[{"value":"English","encoding":"ISO369-2"}],"identifier":[{"value":"https://www.archive.org/details/murrayshandbooke00john","volume":"Getty Research Institute digitized version (Internet Archive)","encoding":"URI"}],"type":[{"value":"Text","encoding":"DCMI Type Vocabulary"}],"description":[{"value":"Cover title."},{"value":"Spine title: Hand-book Essex, Suffolk, Norfolk, Cambridgeshire."}],"relation":[{"value":"Murray's English handbooks","qualifier":"isPartOf"}],"publisher":[{"value":"J. Murray"}]},"_ingest_date":"2015-10-19","_edition":"3rd ed.","_creator_display":["John Murray (Firm)"],"_language":["English"],"_creator_facet":["John Murray (Firm)"],"_date_facet":"1900","_grp_contributor":"Getty Research Institute"},"_version":1,"found":True}

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

        search_data = [{"_type":"book","_index":"portal","_id":"gri_9922088190001551","_source":{"_subject_facets":["Masonry","Stone-cutting"],"_record_link":"https://www.archive.org/details/gri_33125000664686","_grp_id":"gri_9922088190001551","_title_display":"Practical masonry : a guide to the art of stone cutting : comprising the construction, setting-out, and working of stairs, circular work, arches, niches, domes, pendentives, vaults, tracery windows, etc. : to which are added supplements relating to masonry estimating and quantity surveying, and to building stones and marbles, and a glossary of terms for the use of students, masons, and craftsmen / by William R. Purchase.","_date_display":"1904","dublin_core":{"date":[{"value":"1904","qualifier":"issued"}],"title":[{"value":"Practical masonry : a guide to the art of stone cutting : comprising the construction, setting-out, and working of stairs, circular work, arches, niches, domes, pendentives, vaults, tracery windows, etc. : to which are added supplements relating to masonry estimating and quantity surveying, and to building stones and marbles, and a glossary of terms for the use of students, masons, and craftsmen / by William R. Purchase."}],"creator":[{"value":"Purchase, William R."}],"format":[{"value":"viii, 218 p. :","qualifier":"extent"}],"identifier":[{"value":"https://www.archive.org/details/gri_33125000664686","volume":"Getty Research Institute digitized version (Internet Archive)","encoding":"URI"}],"language":[{"value":"English","encoding":"ISO369-2"}],"subject":[{"value":"Masonry.","encoding":"LCSH"},{"value":"Stone-cutting.","encoding":"LCSH"},{"value":"TH5401 .P97","encoding":"LCC"}],"type":[{"value":"Text","encoding":"DCMI Type Vocabulary"}],"publisher":[{"value":"C. Lockwood and Son"}]},"_ingest_date":"2015-10-19","_edition":"5th ed., enl.","_creator_display":["Purchase, William R."],"_language":["English"],"_creator_facet":["Purchase, William R"],"_date_facet":"1904","_grp_contributor":"Getty Research Institute"},"_score":None,"sort":["Practical masonry : a guide to the art of stone cutting : comprising the construction, setting-out, and working of stairs, circular work, arches, niches, domes, pendentives, vaults, tracery windows, etc. : to which are added supplements relating to masonry estimating and quantity surveying, and to building stones and marbles, and a glossary of terms for the use of students, masons, and craftsmen / by William R. Purchase."]},{"_type":"book","_index":"portal","_id":"gri_9921999570001551","_source":{"_record_link":"https://www.archive.org/details/illustratedcatal00metr","_grp_id":"gri_9921999570001551","_contributor_display":["Metropolitan Museum of Art (New York, N.Y.)"],"_title_display":"Illustrated catalogue : paintings in the Metropolitan Museum of Art, New York.","_date_display":"1905","dublin_core":{"contributor":[{"value":"Metropolitan Museum of Art (New York, N.Y.)"}],"date":[{"value":"1905","qualifier":"issued"}],"title":[{"value":"Illustrated catalogue : paintings in the Metropolitan Museum of Art, New York."},{"value":"Paintings in the Metropolitan Museum of Art.","qualifier":"alternative"}],"creator":[{"value":"Metropolitan Museum of Art (New York, N.Y.)"}],"format":[{"value":"xlii, 246 p., [91] leaves of plates :","qualifier":"extent"}],"identifier":[{"value":"https://www.archive.org/details/illustratedcatal00metr","volume":"Getty Research Institute digitized version (Internet Archive)","encoding":"URI"}],"language":[{"value":"English","encoding":"ISO369-2"}],"subject":[{"value":"Metropolitan Museum of Art (New York, N.Y.) -- Catalogs.","encoding":"LCSH"}],"description":[{"value":"\"(From forth issue)\" ; (with addenda to January, 1907, inclusive)\""},{"value":"Includes bibliographical references."}],"type":[{"value":"Text","encoding":"DCMI Type Vocabulary"}],"publisher":[{"value":"The Museum"}]},"_ingest_date":"2015-10-19","_subject_facets":["Metropolitan Museum of Art (New York, N.Y.)","Catalogs"],"_creator_display":["Metropolitan Museum of Art (New York, N.Y.)"],"_language":["English"],"_creator_facet":["Metropolitan Museum of Art (New York, N.Y.)","Metropolitan Museum of Art (New York, N.Y.)"],"_date_facet":"1905","_grp_contributor":"Getty Research Institute"},"_score":None,"sort":["Illustrated catalogue : paintings in the Metropolitan Museum of Art, New York."]}]

        self.assertEqual(response.data[0]['hits']['hits'], search_data)
