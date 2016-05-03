from django.shortcuts import render
from django.http import HttpResponse
from django.views.generic import View
from elasticsearch import Elasticsearch
from elasticsearch_dsl import Search, Q

class Book(View):
    def get(self, request):
      es = Elasticsearch(['local.portal.dev:9200'])
      response = es.get(index='portal', doc_type='book', id='bnf_bpt6k63447547', request_timeout=30)
      print(response)
        # <view logic>
      return HttpResponse(response)