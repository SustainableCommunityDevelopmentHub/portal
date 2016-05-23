from django.shortcuts import render
from django.http import HttpResponse
from django.views.generic import View
from elasticsearch import Elasticsearch
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

import json
import urllib


class Book(APIView):
    def get(self, request, id, format=None):
        es = Elasticsearch(['local.portal.dev:9200'])
        book_id = id
        response = es.get(index='portal', doc_type='book', id=book_id, request_timeout=30)
        j = json.loads(json.dumps(response))

        return Response(j, status=status.HTTP_200_OK)


class Contributors(APIView):
    def get(self, request, format=None):
        es = Elasticsearch(['local.portal.dev:9200'])
        query = {'aggregations': {'grp_contributor': {'terms': {'field': '_grp_contributor.raw',
                                                                'size': 1000,
                                                                'order': {'_count': 'desc'}}}}}
        response = es.search(index='portal', doc_type='book', body=query)
        response_json = json.loads(json.dumps(response))
        return Response(response_json['aggregations']['grp_contributor']['buckets'], status=status.HTTP_200_OK)


class Books(APIView):
    advanced_fields = ['adv_date','adv_creator', 'adv_subject', 'adv_title', 'adv_contributor', 'adv_language']
    facet_categories = ['creator', 'subject', 'grp_contributor', 'language']

    def get(self, request, params, format=None):
        search_options = urllib.parse.parse_qs(params)
        es = Elasticsearch(['local.portal.dev:9200'])
        body = self.create_base_query()
        filters = []
        advanced_filters = []
        body['query']['bool']['must'] = self.create_query_string(search_options.get('q'))
        body['sort'] = self.create_sort_query(search_options.get('sort'))

        if search_options.get('date_gte') or search_options.get('date_lte'):
            date_query = self.create_date_query(search_options.get('date_gte'), search_options.get('date_lte'))
            body['query']['bool']['filter']['bool']['filter'].append(date_query)
            filters.append(date_query)

        for field in self.advanced_fields:
            if search_options.get(field):
                adv_filters = self.create_advanced_filters(field, search_options.get(field))
                for filter in adv_filters:
                    body['query']['bool']['filter']['bool']['filter'].append(filter)
                    advanced_filters.append(filter)

        if len(advanced_filters):
            filters.append(advanced_filters)

        for category in self.facet_categories:
            if search_options.get(category):
                facet_filters = self.create_facet_filters(category, search_options.get(category))
                body['query']['bool']['filter']['bool']['must'].append(facet_filters)
                for other_category in self.facet_categories:
                    if other_category != category:
                        body['aggregations'][other_category]['filter']['bool']['must'].append(facet_filters)

        query = self.create_multisearch(body, search_options.get('from'), search_options.get('size'), filters)
        response = es.msearch(body=query)
        j = json.loads(json.dumps(response))
        return Response(j['responses'], status=status.HTTP_200_OK)

    def create_sort_query(self, sort):
        valid_sorts = {'date_added': {'_ingest_date': {'order': 'desc'}},
                       'title_asc': '_title_display.sort',
                       'title_desc': {'_title_display.sort': {'order': 'desc'}},
                       'date_asc': '_date_facet',
                       'date_desc': {'_date_facet': {'order': 'desc'}}}
        if sort:
            return valid_sorts.get(sort[0], [])
        else:
            return []

    def create_date_query(self, from_date, to_date):
        if from_date:
            date_gte = from_date[0]
        else:
            date_gte = None
        if to_date:
            date_lte = to_date[0]
        else:
            date_lte = None
        return {'range': {'_date_facet': {'gte': date_gte,
                                          'lte': date_lte}}}

    def create_facet_filters(self, category, facets):
        filters = []
        keys = {'creator': '_creator_facet.raw',
                'subject': '_subject_facets.raw',
                'grp_contributor': '_grp_contributor.raw',
                'language': '_language'}
        key = keys.get(category)
        if key:
            filters = [{'term': {key: facet}} for facet in facets]
        return {'bool': {'should': filters}}

    def create_advanced_filters(self, field, terms):
        fields = {'adv_contributor': ['_grp_contributor', '_grp_contributor.folded'],
                  'adv_date': ['_date_facet.folded', 'dublin_core.date.value', 'dublin_core.date.value.folded']}
        field_term = fields.get(field, ['dublin_core.' + field + '.value', 'dublin_core.' + field + '.value.folded'])

        filters = []
        for term in terms:
            filter = {'query_string': {'query': term,
                                       'minimum_should_match': '2<-1 5<75%',
                                       'fields': field_term}}
            filters.append(filter)
        return filters

    def create_base_query(self):
        query = {'query': {'bool': {'must': {},
                                    'filter': {'bool': {'must': [],
                                                        'filter': []}}}},
                 'aggregations': {'creator': {'filter': {'bool': {'must': []}},
                                              'aggs': {'creator':
                                                        {'terms': {'field': '_creator_facet.raw', 'size': 1000}}}},
                                  'language': {'filter': {'bool': {'must': []}},
                                               'aggs': {'language':
                                                        {'terms': {'field': '_language', 'size': 1000}}}},
                                  'grp_contributor': {'filter': {'bool': {'must': []}},
                                                      'aggs': {'grp_contributor':
                                                                {'terms': {'field': '_grp_contributor.raw', 'size': 1000}}}},
                                  'subject': {'filter': {'bool': {'must': []}},
                                              'aggs': {'subject':
                                                        {'terms': {'field': '_subject_facets.raw', 'size': 1000}}}}}}
        return query

    def create_query_string(self, q):
        if q:
            return {'query_string': {'query': q[0],
                                     'minimum_should_match': '2<-1 5<75%',
                                     'fields': ['_record_link',
                                                '_language',
                                                '_language.folded',
                                                '_grp_type',
                                                '_title_display^18',
                                                '_title_display.folded^18',
                                                '_subject_facets^15',
                                                '_subject_facets.folded^15',
                                                '_creator_display',
                                                '_creator_display.folded',
                                                '_creator_facet^12',
                                                '_creator_facet.folded^12',
                                                '_date_facet.folded',
                                                '_date_display',
                                                '_date_display.folded',
                                                '_grp_contributor',
                                                '_grp_contributor.folded',
                                                '_grp_id',
                                                '_edition',
                                                '_edition.folded',
                                                '_series',
                                                '_series.folded',
                                                'dublin_core.identifier.value',
                                                'dublin_core.identifier.value.folded',
                                                'dublin_core.creator.value',
                                                'dublin_core.creator.value.folded',
                                                'dublin_core.date.value',
                                                'dublin_core.date.value.folded',
                                                'dublin_core.publisher.value',
                                                'dublin_core.publisher.value.folded',
                                                'dublin_core.format.value',
                                                'dublin_core.format.value.folded',
                                                'dublin_core.type.value',
                                                'dublin_core.type.value.folded',
                                                'dublin_core.description.value',
                                                'dublin_core.description.value.folded',
                                                'dublin_core.provenance.value',
                                                'dublin_core.provenance.value.folded',
                                                'dublin_core.language.value',
                                                'dublin_core.language.value.folded',
                                                'dublin_core.subject.value',
                                                'dublin_core.subject.value.folded',
                                                'dublin_core.coverage.value',
                                                'dublin_core.coverage.value.folded',
                                                'dublin_core.title.value',
                                                'dublin_core.title.value.folded',
                                                'dublin_core.contributor.value',
                                                'dublin_core.contributor.value.folded',
                                                'dublin_core.relation.value',
                                                'dublin_core.relation.value.folded',
                                                'dublin_core.source.value',
                                                'dublin_core.source.value.folded',
                                                'dublin_core.rights.value',
                                                'dublin_core.rights.value.folded',
                                                'dublin_core.accrualMethod.value',
                                                'dublin_core.accrualMethod.value.folded',
                                                'dublin_core.accrualPeriodicity.value',
                                                'dublin_core.accrualPeriodicity.value.folded',
                                                'dublin_core.audience.value',
                                                'dublin_core.audience.value.folded']}}
        else:
            return {'match_all': {}}

    def create_multisearch(self, body, start, size, filters):
        index = {'index': 'portal', 'doc_type': 'book'}
        query = [index,
                 {'size': size[0],
                  'from': start[0],
                  'query': body.get('query'),
                  'sort': body.get('sort')
                },
                 index,
                 {'size': 0,
                  'query': {'bool': {'must': body['query']['bool']['must'],
                                     'filter': {'bool': {'must': filters}}}},
                  'aggregations': body['aggregations']}]

        request = [json.dumps(item) for item in query]
        return ' \n'.join(request)


class MyTest(APIView):
    def get(self, request):
        print('view is working!');
        message = {"message": "hi"}
        return Response(json.loads(json.dumps(message)), status=status.HTTP_200_OK)