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

class DublinCoreRenderer(renderers.BaseRenderer):
    media_type = 'text/plain'
    format = 'dc'
    charset = 'iso-8859-1'

    def render(self, data, media_type=None, renderer_context=None):
       return data

class Book(APIView):
    renderer_classes = (DublinCoreRenderer, )
    def get(self, request, id, format=None):
      es = Elasticsearch(['local.portal.dev:9200'])
      book_id = id
      response = es.get(index='portal', doc_type='book', id=book_id, request_timeout=30)
      j = json.loads(json.dumps(response))
      print(j)

      r = Response(j['_source'], status=status.HTTP_200_OK)


      return r

