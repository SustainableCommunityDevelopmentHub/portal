import os
from glob import glob
from shutil import rmtree, copyfile
from pprint import pprint
from datetime import datetime

import json
from django.core.management.base import BaseCommand
from ingest.models import Record

from funnel import marc, dublin_core, mets



class Command(BaseCommand):
	help = 'Processes all Portal data'

	def process_marc(self, data_path):
		schema = Record.MARC
		outpath = os.path.join(data_path, 'marc_data/*/*_output')
		marc_output = glob(outpath)
		for outdir in marc_output:
			print('Deleting {}'.format(outdir))
			rmtree(outdir)
		inpath = os.path.join(data_path, 'marc_data/*/*')
		marc_input = glob(inpath)
		for f in marc_input:
			print('Input file is: {}'.format(f))
			filename = f.split('/')[-1]
			no_ext = filename.split('.')[0]
			date = no_ext.split('_')[-1]
			print('Input date is: {}'.format(date))
			marc.main(f, date)
			batch = '{}_output/{}_batch'.format(f.split('.')[0], no_ext)
			print(batch)
			with open(batch) as batch_file:
				for line in batch_file:
					if not line.startswith('{\"index\":'):
						data = json.loads(line)
						pprint(data)
						self.populate_db(data, f, batch, schema)

	def process_dc(self, data_path):
		schema = Record.DC
		outpath = os.path.join(data_path, 'dc_data/*_output')
		dc_output = glob(outpath)
		for outdir in dc_output:
			print('Deleting {}'.format(outdir))
			rmtree(outdir)
		inpath = os.path.join(data_path, 'dc_data/*')
		dc_input = glob(inpath)
		print(dc_input)
		for f in dc_input:
			print('Input dir is: {}'.format(f))
			dirname = f.split('/')[-1]
			print(dirname)
			date = f.split('_')[-1]
			print('Input date is: {}'.format(date))
			dublin_core.main(f, date)
			batch = '{}_output/{}_batch'.format(f, dirname)
			print(batch)
			with open(batch) as batch_file:
				for line in batch_file:
					if not line.startswith('{\"index\":'):
						data = json.loads(line)
						pprint(data)
						self.populate_db(data, f, batch, schema)

	def process_mets(self, data_path):
		schema = Record.METS
		outpath = os.path.join(data_path, 'mets_data/*_output')
		mets_output = glob(outpath)
		for outdir in mets_output:
			print('Deleting {}'.format(outdir))
			rmtree(outdir)
		inpath = os.path.join(data_path, 'mets_data/*')
		mets_input = glob(inpath)
		print(mets_input)
		for f in mets_input:
			print('Input dir is: {}'.format(f))
			dirname = f.split('/')[-1]
			print(dirname)
			date = f.split('_')[-1]
			print('Input date is: {}'.format(date))
			mets.main(f, date)
			batch = '{}_output/{}_batch'.format(f, dirname)
			print(batch)
			with open(batch) as batch_file:
				for line in batch_file:
					if not line.startswith('{\"index\":'):
						data = json.loads(line)
						pprint(data)
						self.populate_db(data, f, batch, schema)

	def populate_db(self, data, f, batch, schema):
		portal_id = data['_grp_id']
		date = data['_ingest_date']
		date_elements = date.split('-')
		date = datetime(int(date_elements[0]), int(date_elements[1]), int(date_elements[2]))
		date = datetime.date(date)
		contributor = data['_grp_contributor']
		rec = Record.objects.filter(identifier=portal_id)
		if len(rec) == 1:
			print('record exists')
			for r in rec:
				if r.ingest_date == date:
					print('record not updated')
				elif r.ingest_date < date:
					r.updated_date = date
					r.path = batch
					r.source_path = f
					r.save()
					print('record updated')
		elif len(rec) < 1:
			print('no record found')
			Record.objects.create(identifier=portal_id, path=batch, ingest_date=date, contributor=contributor, source_path=f, source_schema=schema)

	def create_batchdir(self, data_path):
		process_date = str(datetime.today().date())
		batchdir = 'batch_files_{}'.format(process_date)
		batchpath = os.path.join(data_path, batchdir)
		if not os.path.exists(batchpath):
			os.mkdir(batchpath)
		marcpath = os.path.join(data_path, 'marc_data/*/*_output/*_batch')
		dcpath = os.path.join(data_path, 'dc_data/*_output/*_batch')
		metspath = os.path.join(data_path, 'mets_data/*_output/*_batch')
		marc_batch = glob(marcpath)
		dc_batch = glob(dcpath)
		mets_batch = glob(metspath)
		all_batch = marc_batch + dc_batch + mets_batch
		for batch in all_batch:
			fname = batch.split('/')[-1]
			cname = '{}/{}'.format(batchpath, fname)
			copyfile(batch, cname)

	def add_arguments(self, parser):
		parser.add_argument('data_path', type=str)

	def handle(self, *args, **options):
		self.process_marc(options['data_path'])
		self.process_dc(options['data_path'])
		self.process_mets(options['data_path'])
		self.create_batchdir(options['data_path'])
