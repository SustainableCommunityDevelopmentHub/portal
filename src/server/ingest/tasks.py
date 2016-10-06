import os
import zipfile
import shutil
from glob import glob
import requests
import filecmp
from datetime import datetime

from django.db import models
from django.conf import settings
from pymarc import MARCWriter
from lxml import etree

from funnel import marc, dublin_core, mets
from ingest import helpers
from ingest.models import Contributor, Record



MARC_DATA = [
	'artic',
	'avery',
	'brooklyn',
	'cleveland',
	'frick',
	'gpvl',
	'gri',
	'menil',
	'ngcanada',
	'osci',
	'pma',
	'smithsonian',
	'warburg'
]

DC_DATA = [
	'bnf',
	'clark',
	'inha',
	'malaga',
	'met',
	'wolf'
]

METS_DATA = [
	'hertz',
	'hkhi',
	'khi',
	'uh'
]

SAMPLE_DATA = [
	'bnf',
	'inha',
	'malaga',
	'met',
	'uh'
]

def create_source(data_path, supplied_dir):
	inst, idate, date_dir = assign_directories(data_path, supplied_dir)
	if inst in MARC_DATA:
		create_source_marc(data_path, supplied_dir, inst, idate, date_dir)
	elif inst in DC_DATA:
		create_source_dc(data_path, supplied_dir, inst, idate, date_dir)
	elif inst in METS_DATA:
		create_source_mets(data_path, supplied_dir, inst, idate, date_dir)

def assign_directories(data_path, supplied_dir):
	inst = supplied_dir.split('/')[-1].split('_')[0]
	idate = supplied_dir.split('/')[-1].split('_')[-1]
	inst_dir = os.path.join(data_path, 'source_data', inst)
	if not os.path.isdir(inst_dir):
		os.mkdir(inst_dir)
	date_dir = os.path.join(inst_dir, idate)
	if not os.path.isdir(date_dir):
		os.mkdir(date_dir)
	return inst, idate, date_dir

def create_source_marc(data_path, supplied_dir, inst, idate, date_dir):
	infs = '{}/*'.format(supplied_dir)
	for f in glob(infs):
		marc_list = helpers.get_marc_list(f)
		for record in marc_list:
			recid = helpers.get_marc_id(inst, record)
			outname = '{}.mrc'.format(recid)
			try:
				with open(os.path.join(date_dir, outname), 'wb') as outf:
					writer = MARCWriter(outf)
					writer.write(record)
				print('Created source record {}'.format(os.path.join(date_dir, outname)))
			except UnicodeEncodeError:
				if inst == 'gri' and record.leader[9] == ' ':
					record.leader = record.leader[0:9] + 'a' + record.leader[10:]
					with open(os.path.join(date_dir, outname), 'wb') as outf:
						writer = MARCWriter(outf)
						writer.write(record)
					print('Created source record {}'.format(os.path.join(date_dir, outname)))
	archive(data_path, inst, supplied_dir)

def create_source_dc(data_path, supplied_dir, inst, idate, date_dir):
	infs = '{}/*'.format(supplied_dir)
	for f in glob(infs):
		with open(f, 'rb') as inf:
			record = etree.parse(inf)
			root = record.getroot()
			nsmap = root.nsmap
			if inst == 'met':
				ident = helpers.get_met_id(record, root, nsmap)
			elif inst == 'malaga':
				ident = helpers.get_malaga_id(record, root, nsmap)
			else:
				ident = helpers.get_dc_id(inst, f, record, root, nsmap)
		if ident is not None:
			recid = '{}_{}'.format(inst, ident)
			outname = '{}.xml'.format(recid)
			with open(os.path.join(date_dir, outname), 'wb') as outf:
				record.write(outf, encoding='UTF-8')
			print('Created source record {}'.format(os.path.join(date_dir, outname)))
	archive(data_path, inst, supplied_dir)


def create_source_mets(data_path, supplied_dir, inst, idate, date_dir):
	infs = '{}/*'.format(supplied_dir)
	for f in glob(infs):
		with open(f, 'r') as inf:
			record = helpers.get_mets_rec(inst, inf)
			root = record.getroot()
			nsmap = root.nsmap
			if inst == 'hertz':
				ident = helpers.get_mets_id(record, root, nsmap, 'METS')
			elif inst == 'hkhi':
				ident = helpers.get_hkhi_id(record, root, nsmap)
			elif inst == 'khi':
				ident = helpers.get_khi_id(record, root, nsmap)
			elif inst.startswith('uh'):
				ident = helpers.get_mets_id(record, root, nsmap, 'mets')
			if ident is not None:
				if inst == 'hkhi':
					recid = 'khi_{}'.format(ident)
				else:
					recid = '{}_{}'.format(inst, ident)
				outname = '{}.xml'.format(recid)
				with open(os.path.join(date_dir, outname), 'wb') as outf:
					record.write(outf, encoding='UTF-8')
				print('Created source record {}'.format(os.path.join(date_dir, outname)))
	archive(data_path, inst, supplied_dir)

def archive(data_path, inst, supplied_dir):
	archive_dir = os.path.join(data_path, 'archived_data', inst)
	if not os.path.isdir(archive_dir):
		os.mkdir(archive_dir)
	zipname = supplied_dir.split('/')[-1]
	zipname = '{}/{}.zip'.format(archive_dir, zipname)
	with zipfile.ZipFile(zipname, 'w') as contrib_zip:
		for dirname, subdirs, files in os.walk(supplied_dir):
			for filename in files:
				contrib_zip.write(os.path.join(dirname, filename), os.path.basename(filename))
	shutil.rmtree(supplied_dir)




