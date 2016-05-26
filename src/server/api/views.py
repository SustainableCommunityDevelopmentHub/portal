import json
import urllib

from django.shortcuts import render
from django.http import HttpResponse
from django.views.generic import View
from elasticsearch import Elasticsearch
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from . import es_functions

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
    advanced_fields = ['adv_date','adv_creator', 'adv_subject', 'adv_title', 'adv_grp_contributor', 'adv_language']
    facet_categories = ['creator', 'subject', 'grp_contributor', 'language']

    def get(self, request, params, format=None):
        print(params)
        search_options = urllib.parse.parse_qs(params)
        print(search_options)
        es = Elasticsearch(['local.portal.dev:9200'])
        body = es_functions.create_base_query()
        filters = []
        advanced_filters = []
        body['query']['bool']['must'] = es_functions.create_query_string(search_options.get('q'))
        body['sort'] = es_functions.create_sort_query(search_options.get('sort'))

        if search_options.get('date_gte') or search_options.get('date_lte'):
            date_query = es_functions.create_date_query(search_options.get('date_gte'), search_options.get('date_lte'))
            body['query']['bool']['filter']['bool']['filter'].append(date_query)
            filters.append(date_query)

        for field in self.advanced_fields:
            if search_options.get(field):
                adv_filters = es_functions.create_advanced_filters(field, search_options.get(field))
                for filter in adv_filters:
                    body['query']['bool']['filter']['bool']['filter'].append(filter)
                    advanced_filters.append(filter)

        if len(advanced_filters):
            filters.append(advanced_filters)

        for category in self.facet_categories:
            if search_options.get(category):
                facet_filters = es_functions.create_facet_filters(category, search_options.get(category))
                body['query']['bool']['filter']['bool']['must'].append(facet_filters)
                for other_category in self.facet_categories:
                    if other_category != category:
                        body['aggregations'][other_category]['filter']['bool']['must'].append(facet_filters)

        query = es_functions.create_multisearch(body, search_options.get('from'), search_options.get('size'), filters)
        response = es.msearch(body=query)
        j = json.loads(json.dumps(response))
        return Response(j['responses'], status=status.HTTP_200_OK)
