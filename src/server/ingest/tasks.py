import os
from glob import glob
import json
import requests
import filecmp

from django.conf import settings
from pymarc import MARCWriter
from lxml import etree

from funnel import marc, dublin_core, mets
from ingest.models import Record, Contributor
from ingest import helpers


MARC_INST = [
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

DC_INST = [
	'bnf',
	'clark',
	'inha',
	'malaga',
	'met',
	'wolf'
]

METS_INST = [
	'hertz',
	'hkhi',
	'khi',
	'uh',
]

SAMPLE_DATA = [
	'bnf',
	'inha',
	'malaga',
	'met',
	'uh'
]

def create_source(data_path):
	create_source_marc(data_path)
	create_source_dc(data_path)
	create_source_mets(data_path)

def assign_directories(data_path, contrib_dir):
	inst = contrib_dir.split('/')[-1].split('_')[0]
	idate = contrib_dir.split('/')[-1].split('_')[-1]
	inst_dir = os.path.join(data_path, 'source_data', inst)
	if not os.path.isdir(inst_dir):
		os.mkdir(inst_dir)
	date_dir = os.path.join(inst_dir, idate)
	if not os.path.isdir(date_dir):
		os.mkdir(date_dir)
	return inst, idate, date_dir

def create_source_marc(data_path):
	contrib_dirs = '{}/contributed_data/marc_data/*'.format(data_path)
	for contrib_dir in glob(contrib_dirs):
		inst, idate, date_dir = assign_directories(data_path, contrib_dir)
		infs = '{}/*'.format(contrib_dir)
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

def create_source_dc(data_path):
	contrib_dirs = '{}/contributed_data/dc_data/*'.format(data_path)
	for contrib_dir in glob(contrib_dirs):
		inst, idate, date_dir = assign_directories(data_path, contrib_dir)
		infs = '{}/*'.format(contrib_dir)
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

def create_source_mets(data_path):
	contrib_dirs = '{}/contributed_data/mets_data/*'.format(data_path)
	for contrib_dir in glob(contrib_dirs):
		inst, idate, date_dir = assign_directories(data_path, contrib_dir)
		infs = '{}/*'.format(contrib_dir)
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

def create_index(es):
	print(es)
	ES_PORTAL = '{}/portal'.format(es)
	ES_BOOK_MAP = '{}/_mapping/book'.format(ES_PORTAL)

	r = requests.delete(ES_PORTAL)
	print('Deleting... {}'.format(r.status_code))

	portal_dir = os.path.join(settings.BASE_DIR, '../..')

	f = open(os.path.join(portal_dir, 'elastic_settings.json'))
	data = json.loads(f.read())
	r = requests.put(ES_PORTAL, json=data)
	print('Creating Portal index...{}'.format(r.status_code))

	f = open(os.path.join(portal_dir, 'elastic_mapping.json'))
	data = json.loads(f.read())
	r = requests.put(ES_BOOK_MAP, json=data)
	print('Creating Book mapping...{}'.format(r.status_code))

def process_data(source_path, es):
	source = os.path.join(source_path, 'source_data')
	for inst in os.listdir(source):
		if inst == '.DS_Store':
			continue
		inst_dir = os.path.join(source, inst)
		for idate in os.listdir(inst_dir):
			if idate == '.DS_Store':
				continue
			date_dir = os.path.join(inst_dir, idate)
			print(date_dir + '\n\n')
			for inf in os.listdir(date_dir):
				if inf == '.DS_Store':
					continue
				recid = inf.split('.')[0]
				fpath = os.path.join(date_dir, inf)
				print('{}\n'.format(fpath))
				erec = Record.objects.filter(pk=recid)
				if len(erec) == 0:
					contrib = Contributor.objects.get(pk=inst)
					if inst in MARC_INST:
						Record.objects.create(pk=recid, ingest_date=idate, contributor=contrib, source_path=fpath, source_schema='MA')
						rec = marc.main(fpath)
					elif inst in DC_INST:
						Record.objects.create(pk=recid, ingest_date=idate, contributor=contrib, source_path=fpath, source_schema='DC')
						rec = dublin_core.main(fpath)
					elif inst in METS_INST:
						Record.objects.create(pk=recid, ingest_date=idate, contributor=contrib, source_path=fpath, source_schema='ME')
						rec = mets.main(fpath)
					if es == 'http://local.portal.dev:9200':
						if inst == 'gri' and idate == '2015-10-19':
							load_es(es, recid, rec)
						elif inst in SAMPLE_DATA:
							load_es(es, recid, rec)
					else:
						load_es(es, recid, rec)
				elif len(erec) == 1:
					oldrec = erec[0]
					oldpath = oldrec.source_path
					print(oldpath)
					diff = filecmp.cmp(fpath, oldpath, shallow=False)
					if diff is False:
						print('Update Record')
						oldrec.updated_date = idate
						oldrec.source_path = fpath
						oldrec.save()
						if inst in MARC_INST:
							rec = marc.main(fpath)
						elif inst in DC_INST:
							rec = dublin_core.main(fpath)
						elif inst in METS_INST:
							rec = mets.main(fpath)
						if es == 'http://local.portal.dev:9200':
							if inst == 'gri' and idate == '2015-10-19':
								load_es(es, recid, rec)
							elif inst in SAMPLE_DATA:
								load_es(es, recid, rec)
						else:
							load_es(es, recid, rec)
					else:
						print('No Diff, Do Nothing')		

def load_es(es, recid, rec):
	ES_DOC = '{}/portal/book/{}'.format(es, recid)

	try:
		resp = requests.put(ES_DOC, data=rec.encode('utf-8'))
	except:
		print(recid)
		raise
	print('Uploading {}...{}\n'.format(recid, resp.status_code))

def main():
	#create_source(settings.TEST_DATA)
	create_source(settings.PRODUCTION_DATA)
	#create_index(settings.LOCAL)
	#process_data(settings.TEST_DATA, settings.LOCAL)


if __name__ == '__main__':
	main()