import json
import urllib

from django.shortcuts import render
from django.http import HttpResponse
from django.views.generic import View
from django.conf import settings
from elasticsearch import Elasticsearch
from elasticsearch.exceptions import NotFoundError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.views.decorators.csrf import csrf_exempt

from . import es_functions
from api.renderers import RawRenderer, JSONDCRenderer, XMLDCRenderer, RISRenderer
from rest_framework.renderers import JSONRenderer

ELASTICSEARCH_ADDRESS = settings.ELASTICSEARCH_HOST + ":" + settings.ELASTICSEARCH_PORT

class Book(APIView):

    renderer_classes = (RawRenderer, JSONDCRenderer, XMLDCRenderer, RISRenderer, )

    def get(self, request, id, format=None):
        es = Elasticsearch([ELASTICSEARCH_ADDRESS])
        book_id = id
        try:
            response = es.get(index='portal', doc_type='book', id=book_id, request_timeout=30)
        except NotFoundError as err:
            return Response(err.info, status=status.HTTP_404_NOT_FOUND)
        data = json.loads(json.dumps(response))
        return Response(data, status=status.HTTP_200_OK)


class Contributors(APIView):

    renderer_classes = (JSONRenderer, )

    def get(self, request, format=None):
        es = Elasticsearch([ELASTICSEARCH_ADDRESS])
        query = {'aggregations': {'grp_contributor': {'terms': {'field': '_grp_contributor.raw',
                                                                'size': 1000,
                                                                'order': {'_count': 'desc'}}}}}
        response = es.search(index='portal', doc_type='book', body=query)
        data = json.loads(json.dumps(response))
        return Response(data['aggregations']['grp_contributor']['buckets'], status=status.HTTP_200_OK)


class Books(APIView):

    renderer_classes = (JSONRenderer, )

    advanced_fields = ['adv_date','adv_creator', 'adv_subject', 'adv_title', 'adv_grp_contributor', 'adv_language',
                       'adv_identifier', 'adv_publisher', 'adv_format', 'adv_type', 'adv_description', 'adv_provenance',
                       'adv_relation', 'adv_source', 'adv_rights', 'adv_accrualMethod', 'adv_accrualPeriodicity',
                       'adv_audience']
    facet_categories = ['creator', 'subject', 'grp_contributor', 'language']

    def get(self, request, params, format=None):
        params = params.replace(' & ', ' %26 ')
        params = params.replace(';', '%3B')
        search_options = urllib.parse.parse_qs(params)
        es = Elasticsearch([ELASTICSEARCH_ADDRESS])
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
        data = json.loads(json.dumps(response))
        return Response(data['responses'], status=status.HTTP_200_OK)


@csrf_exempt
def get_feedback_form(request):
    # if this is a POST request we need to process the form data
    if request.method == 'POST':
        # create a form instance and populate it with data from the request:        
        info_dict = json.loads(request.body.decode('utf-8'))
        subject_string = 'Feedback from {} {}'.format(
            info_dict.get('first_name'),
            info_dict.get('last_name')
        )
        email_string = 'Organization: {}\n\nEmail: {}\n\nType: {}\n\nFeedback: {}'.format(
            info_dict.get('organization'),
            info_dict.get('email'),
            info_dict.get('type_of_feedback'),
            info_dict.get('user_feedback')
        )
        print(email_string)
        send_mail(subject_string, email_string, 
            info_dict.get('email'), [settings.EMAIL_TO], fail_silently=False)
        return HttpResponse('Thanks!', status=status.HTTP_200_OK)
