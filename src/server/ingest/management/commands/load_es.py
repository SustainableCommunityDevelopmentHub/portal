import json
import os

from django.core.management.base import BaseCommand
import requests



class Command(BaseCommand):
	help = 'Loads all Portal data to Elasticsearch'

	def add_arguments(self, parser):
		parser.add_argument('data_path', type=str)
		parser.add_argument('environment')

	def handle(self, *args, **options):
		LOCAL = "http://local.portal.dev:9200"  #LOCAL
		DEV = "http://grpdev.getty.edu:9200"  #DEV
		PROD = "http://portal.getty.edu:9200"  #PROD
		env = options['environment']
		print(env)
		if env == 'LOCAL':
			ES = LOCAL
		'''elif env == 'DEV':
			ES = DEV
		elif env == 'PROD':
			ES = PROD'''
		print(ES)

		ES_BULK = ES + "/_bulk"
		ES_PORTAL = ES + "/portal"
		ES_BOOK_MAP = ES_PORTAL + "/_mapping/book"

		DATA_DIR = options['data_path']
		print(DATA_DIR)

		SAMPLE_DATA = [
			'bnf_00010_2015-03-17_batch',
			'gri_00020_2015-10-19_batch',
			'inha_00010_2012-05-31_batch',
			'malaga_00010_2012-05-31_batch',
			'met_00010_2012-05-31_batch',
			'uh_00010_2012-05-31_batch'
		]

		success = 0
		failure = 0

		r = requests.delete(ES_PORTAL)
		print('Deleting... {}'.format(r.status_code))

		f = open('/Users/arossetti/Documents/projects/portal/elastic_settings.json')
		data = json.loads(f.read())
		r = requests.put(ES_PORTAL, json=data)
		print('Creating Portal index...{}'.format(r.status_code))

		f = open('/Users/arossetti/Documents/projects/portal/elastic_mapping.json')
		data = json.loads(f.read())
		r = requests.put(ES_BOOK_MAP, json=data)
		print('Creating Book mapping...{}'.format(r.status_code))

		batches = sorted(os.listdir(DATA_DIR))
		for batch in batches:
			if env == 'LOCAL' and batch in SAMPLE_DATA:
				f = open(os.path.join(DATA_DIR, batch))
				try:
					data = f.read()
					resp = requests.post(ES_BULK, data=data.encode('utf-8'))
				except:
					print(batch)
					raise
				if resp.status_code >= 400:
					failure += 1
				else:
					success += 1
				print('Uploading {}...{}'.format(batch, resp.status_code))
			elif env == 'DEV' or env == 'PROD':
				f = open(os.path.join(DATA_DIR, batch))
				try:
					data = f.read()
					resp = requests.post(ES_BULK, data=data.encode('utf-8'))
				except:
					print(batch)
					raise
				if resp.status_code >= 400:
					failure += 1
				else:
					success += 1
				print('Uploading {}...{}'.format(batch, resp.status_code))

		print("successes: {}\nfailures: {}".format(success, failure))
