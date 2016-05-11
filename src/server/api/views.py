from django.shortcuts import render
from django.http import HttpResponse
from django.views.generic import View
from elasticsearch import Elasticsearch
from elasticsearch_dsl import Search, Q
from django.core import serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import renderers

import json

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
        query = {"aggregations": {
                  "grp_contributor": {
                    "terms": {
                      "field": "_grp_contributor.raw",
                      "size": 1000,
                      "order": { "_count": "desc" }
                    }
                  }
                }
              }
        response = es.search(index='portal', doc_type='book', body=query)
        j = json.loads(json.dumps(response))
        return Response(j['aggregations']['grp_contributor']['buckets'], status=status.HTTP_200_OK)
