import os
import shutil
from glob import glob
import mock
import zipfile
from datetime import datetime
import json

import responses
import requests

from django.test import TestCase
from django.core.management import call_command
from django.utils.six import StringIO
from django.conf import settings

from ingest.models import Contributor, Record
from ingest import tasks, helpers



class ContributorTestCase(TestCase):
	def setUp(self):
		Contributor.objects.create(identifier='bnf', name='Bibliothèque nationale de France', city='Paris',
			country='France', since='2015-03-17', address='http://oai.bnf.fr/oai2/OAIHandler', method='OAI', frequency='QU')
		Contributor.objects.create(identifier='artic', name='Art Institute of Chicago', city='Chicago',
			country='United States', since='2016-06-09', address=None, method='MAN', frequency='AN')

	def test_contrib_fields(self):
		bnf = Contributor.objects.get(pk='bnf')
		artic = Contributor.objects.get(pk='artic')
		self.assertEqual(bnf.get_frequency_display(), 'Quarterly')
		self.assertIsNone(artic.address)


class TaskTests(TestCase):
	@classmethod
	def setUpClass(cls):
		cls.data_path = os.path.join(settings.BASE_DIR, 'ingest/unittest_data')
		cls.supplied_dir_bnf1 = os.path.join(cls.data_path, 'supplied_data/bnf_2015-03-16')
		cls.supplied_dir_bnf2 = os.path.join(cls.data_path, 'supplied_data/bnf_2015-03-17')
		cls.supplied_dir_frick = os.path.join(cls.data_path, 'supplied_data/frick_2012-05-31')
		cls.supplied_dir_uh = os.path.join(cls.data_path, 'supplied_data/uh_2012-05-31')
		cls.es = settings.LOCAL
		cls.bnf = Contributor.objects.create(identifier='bnf', name='Bibliothèque nationale de France', city='Paris',
			country='France', since='2015-03-16', address='http://oai.bnf.fr/oai2/OAIHandler', method='OAI', frequency='QU')
		cls.dupe = Record.objects.create(pk='bnf_bpt6k63442125', ingest_date='2015-03-16', contributor=cls.bnf,
			source_path=os.path.join(cls.data_path, 'source_data/bnf/2015-03-16/bnf_bpt6k63442125.xml'), source_schema='DC')

	@classmethod
	def tearDownClass(cls):
		source = '{}/source_data/*'.format(cls.data_path)
		for source_inst in glob(source):
			shutil.rmtree(source_inst)
		zips = '{}/archived_data/*/*'.format(cls.data_path)
		for zip_file in glob(zips):
			zip_name = zip_file.split('/')[-1].split('.zip')[0]
			zip_ref = zipfile.ZipFile(zip_file, 'r')
			zip_ref.extractall(os.path.join(cls.data_path, 'supplied_data', zip_name))
			zip_ref.close() 
		archive = '{}/archived_data/*'.format(cls.data_path)
		for arch_inst in glob(archive):
			shutil.rmtree(arch_inst)
		os.remove(os.path.join(settings.BASE_DIR, '../client/sitemap-index.xml'))
		os.remove(os.path.join(settings.BASE_DIR, '../client/sitemap-1.xml.gz'))

	def test_assign_directories(self):
		inst, idate, date_dir = tasks.assign_directories(self.data_path, self.supplied_dir_bnf2)
		self.assertEqual(inst, 'bnf')
		self.assertEqual(idate, '2015-03-17')
		self.assertEqual(date_dir, os.path.join(self.data_path, 'source_data/bnf/2015-03-17'))

	def test_create_source(self):
		with mock.patch('ingest.tasks.create_source_marc') as patch_marc:
			tasks.create_source(self.data_path, self.supplied_dir_frick, self.es)
			patch_marc.assert_called()
		with mock.patch('ingest.tasks.create_source_dc') as patch_dc1:
			tasks.create_source(self.data_path, self.supplied_dir_bnf1, self.es)
			patch_dc1.assert_called()
		with mock.patch('ingest.tasks.create_source_dc') as patch_dc2:
			tasks.create_source(self.data_path, self.supplied_dir_bnf2, self.es)
			patch_dc2.assert_called()
		with mock.patch('ingest.tasks.create_source_mets') as patch_mets:
			tasks.create_source(self.data_path, self.supplied_dir_uh, self.es)
			patch_mets.assert_called()

	def test_create_source_marc(self):
		with mock.patch('ingest.tasks.process_data') as patch_process:
			tasks.create_source_marc(self.data_path, self.supplied_dir_frick, 'frick', '2012-05-31', os.path.join(self.data_path,
				'source_data/frick/2012-05-31'), self.es)
			self.assertEqual(119, len(os.listdir(os.path.join(self.data_path,
				'source_data/frick/2012-05-31'))))
			zipf = os.path.join(self.data_path, 'archived_data/frick/frick_2012-05-31.zip')
			self.assertTrue(os.path.isfile(zipf))
			self.assertFalse(os.path.isdir(self.supplied_dir_frick))
			patch_process.assert_called()

	def test_create_source_dc(self):
		with mock.patch('ingest.tasks.process_data') as patch_process:
			tasks.create_source_dc(self.data_path, self.supplied_dir_bnf1, 'bnf',
				'2015-03-16', os.path.join(self.data_path, 'source_data/bnf/2015-03-16'), self.es)
			self.assertEqual(1, len(os.listdir(os.path.join(self.data_path,
				'source_data/bnf/2015-03-16'))))
			zipf1 = os.path.join(self.data_path, 'archived_data/bnf/bnf_2015-03-16.zip')
			self.assertTrue(os.path.isfile(zipf1))
			self.assertFalse(os.path.isdir(self.supplied_dir_bnf1))
			patch_process.assert_called()
			tasks.create_source_dc(self.data_path, self.supplied_dir_bnf2, 'bnf', '2015-03-17', os.path.join(self.data_path,
				'source_data/bnf/2015-03-17'), self.es)
			self.assertEqual(100, len(os.listdir(os.path.join(self.data_path,
				'source_data/bnf/2015-03-17'))))	
			zipf2 = os.path.join(self.data_path, 'archived_data/bnf/bnf_2015-03-17.zip')
			self.assertTrue(os.path.isfile(zipf2))
			self.assertFalse(os.path.isdir(self.supplied_dir_bnf2))
			patch_process.assert_called()

	def test_create_source_mets(self):
		with mock.patch('ingest.tasks.process_data') as patch_process:
			tasks.create_source_mets(self.data_path, self.supplied_dir_uh, 'uh', '2012-05-31', os.path.join(self.data_path,
				'source_data/uh/2012-05-31'), self.es)
			self.assertEqual(100, len(os.listdir(os.path.join(self.data_path,
				'source_data/uh/2012-05-31'))))
			zipf = os.path.join(self.data_path, 'archived_data/uh/uh_2012-05-31.zip')
			self.assertTrue(os.path.isfile(zipf))
			self.assertFalse(os.path.isdir(self.supplied_dir_uh))
			patch_process.assert_called()

	def test_process_data(self):
		with mock.patch('ingest.tasks.process_new_rec') as patch_new, mock.patch('ingest.tasks.process_dupe_rec') as patch_dupe:
			tasks.process_data('bnf', os.path.join(self.data_path, 'source_data/bnf/2015-03-17'), self.es)
			patch_dupe.assert_called_with(self.dupe, 'bnf', 'bnf_bpt6k63442125', '2015-03-17', 
				os.path.join(self.data_path, 'source_data/bnf/2015-03-17/bnf_bpt6k63442125.xml'), self.es)
			patch_new.assert_called()

	def test_process_new_rec(self):
		with mock.patch('ingest.tasks.load_es') as patch_es:
			tasks.process_new_rec('bnf', 'bnf_bpt6k63442140', '2015-03-17', 
				os.path.join(self.data_path, 'source_data/bnf/2015-03-17/bnf_bpt6k63442140.xml'), self.es)
			patch_es.assert_called()

	def test_process_dupe_rec(self):
		with mock.patch('ingest.tasks.load_es') as patch_es:
			self.assertEqual(self.dupe.ingest_date, '2015-03-16')
			tasks.process_dupe_rec(self.dupe, 'bnf', 'bnf_bpt6k63442125', '2015-03-17', 
				os.path.join(self.data_path, 'source_data/bnf/2015-03-17/bnf_bpt6k63442125.xml'), self.es)
			self.assertEqual(Record.objects.get(pk='bnf_bpt6k63442125').updated_date, 
				datetime.strptime('2015-03-17', '%Y-%m-%d').date())
			patch_es.assert_called


	@responses.activate
	def test_load_es_new(self):
		def echo_body(request):
			return (201, {}, request.body)
		# new rec mock response
		url = '{}/portal/book/bnf_bpt6k63442140'.format(self.es)
		responses.add_callback(
			responses.PUT, url,
			callback=echo_body,
			content_type='application/json')
		new = ('{"_language": ["French"], "_date_facet": "1896", "_date_display": '
			 '"1896-05-30", "_record_link": '
			 '"http://gallica.bnf.fr/ark:/12148/bpt6k63442140", "_creator_facet": '
			 '["Houssaye, Édouard. Directeur de publication"], "_grp_contributor": '
			 '"Gallica - Bibliothèque nationale de France", "_contributor_display": '
			 '["Houssaye, Édouard. Directeur de publication"], "_grp_id": '
			 '"bnf_bpt6k63442140", "_title_display": "La Chronique des arts et de la '
			 'curiosité : supplément à la Gazette des beaux-arts", "dublin_core": '
			 '{"rights": [{"value": "public domain"}], "date": [{"value": "1896-05-30"}], '
			 '"description": [{"value": "1896/05/30 (A1896,N22)."}], "title": [{"value": '
			 '"La Chronique des arts et de la curiosité : supplément à la Gazette des '
			 'beaux-arts"}], "publisher": [{"value": "Gazette des beaux-arts (Paris)"}], '
			 '"contributor": [{"value": "Houssaye, Édouard. Directeur de publication"}], '
			 '"format": [{"encoding": "IMT", "value": "application/pdf"}], "relation": '
			 '[{"uri": "http://catalogue.bnf.fr/ark:/12148/cb34421972m", "encoding": '
			 '"URI", "value": "Notice du catalogue"}, {"uri": '
			 '"http://gallica.bnf.fr/ark:/12148/cb34421972m/date", "encoding": "URI", '
			 '"value": "http://gallica.bnf.fr/ark:/12148/cb34421972m/date"}], "type": '
			 '[{"encoding": "DCMI Type Vocabulary", "value": "Text"}, {"value": "printed '
			 'serial"}], "language": [{"value": "French"}], "identifier": [{"encoding": '
			 '"URI", "value": "http://gallica.bnf.fr/ark:/12148/bpt6k63442140"}], '
			 '"source": [{"value": "Bibliothèque nationale de France, département '
			 'Littérature et art, V-11793"}]}, "_ingest_date": "2015-03-17"}')
		returned_new = tasks.load_es('bnf_bpt6k63442140', new, self.es)
		self.assertEqual(len(responses.calls), 1)
		self.assertEqual(returned_new.status_code, 201)
		self.assertEqual(returned_new.text, new)

	@responses.activate
	def test_load_es_update(self):
		def echo_body(request):
			return (200, {}, request.body)
		# update rec mock response
		url = '{}/portal/book/bnf_bpt6k63442125'.format(self.es)
		responses.add_callback(
			responses.PUT, url,
			callback=echo_body,
			content_type='application/json')
		update = ('{"_date_display": "1896-05-16", "_title_display": "La Chronique des arts et '
			 'de la curiosité : supplément à la Gazette des beaux-arts", "_record_link": '
			 '"http://gallica.bnf.fr/ark:/12148/bpt6k63442125", "_grp_id": '
			 '"bnf_bpt6k63442125", "_contributor_display": ["Houssaye, Édouard. Directeur '
			 'de publication"], "_date_facet": "1896", "_grp_contributor": "Gallica - '
			 'Bibliothèque nationale de France", "_ingest_date": "2015-03-17", '
			 '"_language": ["French"], "dublin_core": {"date": [{"value": "1896-05-16"}], '
			 '"rights": [{"value": "public domain"}], "description": [{"value": '
			 '"1896/05/16 (A1896,N20)."}], "publisher": [{"value": "Gazette des beaux-arts '
			 '(Paris)"}], "identifier": [{"value": '
			 '"http://gallica.bnf.fr/ark:/12148/bpt6k63442125", "encoding": "URI"}], '
			 '"contributor": [{"value": "Houssaye, Édouard. Directeur de publication"}], '
			 '"relation": [{"value": "Notice du catalogue", "uri": '
			 '"http://catalogue.bnf.fr/ark:/12148/cb34421972m", "encoding": "URI"}, '
			 '{"value": "http://gallica.bnf.fr/ark:/12148/cb34421972m/date", "uri": '
			 '"http://gallica.bnf.fr/ark:/12148/cb34421972m/date", "encoding": "URI"}], '
			 '"language": [{"value": "French"}], "type": [{"value": "Text", "encoding": '
			 '"DCMI Type Vocabulary"}, {"value": "printed serial"}], "source": [{"value": '
			 '"Bibliothèque nationale de France, département Littérature et art, '
			 'V-11793"}], "title": [{"value": "La Chronique des arts et de la curiosité : '
			 'supplément à la Gazette des beaux-arts"}], "format": [{"value": '
			 '"application/pdf", "encoding": "IMT"}]}, "_creator_facet": ["Houssaye, '
			 'Édouard. Directeur de publication"]}')
		returned_update = tasks.load_es('bnf_bpt6k63442125', update, self.es)
		self.assertEqual(len(responses.calls), 1)
		self.assertEqual(returned_update.status_code, 200)
		self.assertEqual(returned_update.text, update)

	@responses.activate
	def test_load_es_failure(self):
		def echo_body(request):
			return (400, {}, request.body)
		# update rec mock response
		url = '{}/portal/book/bnf_bpt6k63442125'.format(self.es)
		responses.add_callback(
			responses.PUT, url,
			callback=echo_body,
			content_type='application/json')
		failure = ('{"_date_display": "1896-05-16", "_title_display": "La Chronique des arts et '
			 'de la curiosité : supplément à la Gazette des beaux-arts", "_record_link": '
			 '"http://gallica.bnf.fr/ark:/12148/bpt6k63442125", "_grp_id": '
			 '"bnf_bpt6k63442125", "_contributor_display": ["Houssaye, Édouard. Directeur '
			 'de publication"], "_date_facet": "1896", "_grp_contributor": "Gallica - '
			 'Bibliothèque nationale de France", "_ingest_date": "2015-03-17", '
			 '"_language": ["French"], "dublin_core": {"date": [{"value": "1896-05-16"}], '
			 '"rights": [{"value": "public domain"}], "description": [{"value": '
			 '"1896/05/16 (A1896,N20)."}], "publisher": [{"value": "Gazette des beaux-arts '
			 '(Paris)"}], "identifier": [{"value": '
			 '"http://gallica.bnf.fr/ark:/12148/bpt6k63442125", "encoding": "URI"}], '
			 '"contributor": [{"value": "Houssaye, Édouard. Directeur de publication"}], '
			 '"relation": [{"value": "Notice du catalogue", "uri": '
			 '"http://catalogue.bnf.fr/ark:/12148/cb34421972m", "encoding": "URI"}, '
			 '{"value": "http://gallica.bnf.fr/ark:/12148/cb34421972m/date", "uri": '
			 '"http://gallica.bnf.fr/ark:/12148/cb34421972m/date", "encoding": "URI"}], '
			 '"language": [{"value": "French"}], "type": [{"value": "Text", "encoding": '
			 '"DCMI Type Vocabulary"}, {"value": "printed serial"}], "source": [{"value": '
			 '"Bibliothèque nationale de France, département Littérature et art, '
			 'V-11793"}], "title": [{"value": "La Chronique des arts et de la curiosité : '
			 'supplément à la Gazette des beaux-arts"}], "format": [{"value": '
			 '"application/pdf", "encoding": "IMT"}]}, "_creator_facet": ["Houssaye, '
			 'Édouard. Directeur de publication"]}fail')
		returned_failure = tasks.load_es('bnf_bpt6k63442125', failure, self.es)
		self.assertEqual(len(responses.calls), 1)
		self.assertRaises(requests.exceptions.HTTPError)

	def test_build_sitemaps(self):
		tasks.build_sitemaps()
		indexf = os.path.join(settings.BASE_DIR, '../client/sitemap-index.xml')
		self.assertTrue(os.path.isfile(indexf))
		index_data = b'<?xml version=\'1.0\' encoding=\'UTF-8\'?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>http://portal.getty.edu/sitemap-1.xml.gz</loc><lastmod>2017-02-02</lastmod></sitemap></sitemapindex>'
		with open(indexf, 'rb') as index_inf:
			index_content = index_inf.read()
			self.assertEqual(index_data, index_content)
		map1 = os.path.join(settings.BASE_DIR, '../client/sitemap-1.xml.gz')
		self.assertTrue(os.path.isfile(map1))
		map1_data = b'<?xml version=\'1.0\' encoding=\'UTF-8\'?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>http://portal.getty.edu/api/books/bnf_bpt6k63442125</loc><lastmod>2017-02-02</lastmod><priority>0.8</priority></url></urlset>'
		with open(map1, 'rb') as map1_inf:
			map1_content = map1_inf.read()
			self.assertEqual(map1_data, map1_content)
	