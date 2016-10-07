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
	'lbi',
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

def create_source(data_path, supplied_dir, es):
	inst, idate, date_dir = assign_directories(data_path, supplied_dir)
	if inst in MARC_DATA:
		create_source_marc(data_path, supplied_dir, inst, idate, date_dir, es)
	elif inst in DC_DATA:
		create_source_dc(data_path, supplied_dir, inst, idate, date_dir, es)
	elif inst in METS_DATA:
		create_source_mets(data_path, supplied_dir, inst, idate, date_dir, es)

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

def create_source_marc(data_path, supplied_dir, inst, idate, date_dir, es):
	infs = '{}/*'.format(supplied_dir)
	for f in glob(infs):
		print(f)
		if inst == 'lbi':
			with open(f, 'rb') as inf:
				print(inst)
				temp = helpers.fix_lbi(inf, supplied_dir)
				print(temp)
				marc_list = helpers.get_marc_list(temp)
			os.remove(temp)
		else:
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
	process_data(inst, date_dir, es)

def create_source_dc(data_path, supplied_dir, inst, idate, date_dir, es):
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
	process_data(inst, date_dir, es)


def create_source_mets(data_path, supplied_dir, inst, idate, date_dir, es):
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
	process_data(inst, date_dir, es)

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

def process_data(inst, date_dir, es):
	idate = date_dir.split('/')[-1]
	fpaths = '{}/*'.format(date_dir)
	for fpath in glob(fpaths):
		recid = fpath.split('/')[-1].split('.')[0]
		erec = Record.objects.filter(pk=recid)
		if len(erec) == 0:
			process_new_rec(inst, recid, idate, fpath, es)
		elif len(erec) == 1:
			oldrec = erec[0]
			if oldrec.updated_date:
				old_date = oldrec.updated_date
			else:
				old_date = oldrec.ingest_date
			idate_obj = datetime.strptime(idate, '%Y-%m-%d').date()
			if idate_obj >= old_date:
				process_dupe_rec(oldrec, inst, recid, idate, fpath, es)

def process_new_rec(inst, recid, idate, fpath, es):
	contrib = Contributor.objects.get(pk=inst)
	if inst in MARC_DATA:
		Record.objects.create(pk=recid, ingest_date=idate, contributor=contrib, source_path=fpath, source_schema='MA')
		rec = marc.main(fpath)
	elif inst in DC_DATA:
		Record.objects.create(pk=recid, ingest_date=idate, contributor=contrib, source_path=fpath, source_schema='DC')
		rec = dublin_core.main(fpath)
	elif inst in METS_DATA:
		Record.objects.create(pk=recid, ingest_date=idate, contributor=contrib, source_path=fpath, source_schema='ME')
		rec = mets.main(fpath)
	if es == 'http://local.portal.dev:9200':
		if inst == 'gri' and idate == '2015-10-19':
			load_es(recid, rec, es)
		elif inst in SAMPLE_DATA:
			load_es(recid, rec, es)
	else:
		load_es(recid, rec, es)

def process_dupe_rec(oldrec, inst, recid, idate, fpath, es):
	print('Duplicate Record Found')
	oldpath = oldrec.source_path
	diff = filecmp.cmp(fpath, oldpath, shallow=False)
	if diff is False:
		print('Update Record in DB\n')
		oldrec.updated_date = idate
		oldrec.source_path = fpath
		oldrec.save()

	print('Update Record in ES\n')
	if inst in MARC_DATA:
		rec = marc.main(fpath)
	elif inst in DC_DATA:
		rec = dublin_core.main(fpath)
	elif inst in METS_DATA:
		rec = mets.main(fpath)
	if es == 'http://local.portal.dev:9200':
		if inst == 'gri' and idate == '2015-10-19':
			load_es(recid, rec, es)
		elif inst in SAMPLE_DATA:
			load_es(recid, rec, es)
	else:
		load_es(recid, rec, es)

def load_es(recid, rec, es):
	ES_DOC = '{}/portal/book/{}'.format(es, recid)

	try:
		resp = requests.put(ES_DOC, data=rec.encode('utf-8'))
	except:
		print(recid)
		raise
	print('Uploading {}...{}\n'.format(recid, resp.status_code))





