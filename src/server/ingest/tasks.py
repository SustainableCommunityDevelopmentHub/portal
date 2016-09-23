import os
from glob import glob
import json
import requests
import filecmp

from django.conf import settings
from pymarc import MARCReader, XmlHandler, parse_xml, MARCWriter
from lxml import etree

from funnel import marc, dublin_core, mets
from ingest.models import Record, Contributor


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
	#create_source_marc(data_path)
	create_source_marc(data_path)
	#create_source_dc(data_path)
	create_source_dc(data_path)
	#create_source_mets(data_path)
	create_source_mets(data_path)

def create_source_marc(data_path):
	in_dir = os.path.join(data_path, 'contributed_data/marc_data')
	for contrib_dir in os.listdir(in_dir):
		if contrib_dir == '.DS_Store':
			continue
		inst = contrib_dir.split('_')[0]
		idate = contrib_dir.split('_')[-1]
		inst_dir = os.path.join(data_path, 'source_data', inst)
		if not os.path.isdir(inst_dir):
			os.mkdir(inst_dir)
		date_dir = os.path.join(inst_dir, idate)
		if not os.path.isdir(date_dir):
			os.mkdir(date_dir)
		for f in os.listdir(os.path.join(in_dir, contrib_dir)):
			if f == '.DS_Store':
				continue
			if f.endswith('.xml'):
				handler = XmlHandler()
				parse_xml(os.path.join(in_dir, contrib_dir, f), handler)
				for record in handler.records:
					if inst == 'warburg' or inst == 'artic':
						recid = '{}_{}'.format(inst, record['907']['a'])
					else:
						recid = '{}_{}'.format(inst, record['001'].format_field())
					outname = '{}.mrc'.format(recid)
					try:
						with open(os.path.join(date_dir, outname), 'wb') as outf:
							writer = MARCWriter(outf)
							writer.write(record)
						print('Created source record {}'.format(os.path.join(date_dir, outname)))
					except UnicodeEncodeError:
						if inst.startswith('gri') and record.leader[9] == ' ':
							record.leader = record.leader[0:9] + 'a' + record.leader[10:]
							with open(os.path.join(date_dir, outname), 'wb') as outf:
								writer = MARCWriter(outf)
								writer.write(record)
							print('Created source record {}'.format(os.path.join(date_dir, outname)))
			else:
				with open(os.path.join(in_dir, contrib_dir, f), 'rb') as inf:
					reader = MARCReader(inf, to_unicode=True)
					for record in reader:
						if inst == 'warburg' or inst == 'artic':
							recid = '{}_{}'.format(inst, record['907']['a'])
						else:
							recid = '{}_{}'.format(inst, record['001'].format_field())
						outname = '{}.mrc'.format(recid)
						with open(os.path.join(date_dir, outname), 'wb') as outf:
							writer = MARCWriter(outf)
							writer.write(record)
						print('Created source record {}'.format(os.path.join(date_dir, outname)))

def create_source_dc(data_path):
	in_dir = os.path.join(data_path, 'contributed_data/dc_data')
	for harvest_dir in os.listdir(in_dir):
		if harvest_dir == '.DS_Store':
			continue
		inst = harvest_dir.split('_')[0]
		idate = harvest_dir.split('_')[-1]
		inst_dir = os.path.join(data_path, 'source_data', inst)
		if not os.path.isdir(inst_dir):
			os.mkdir(inst_dir)
		date_dir = os.path.join(inst_dir, idate)
		if not os.path.isdir(date_dir):
			os.mkdir(date_dir)
		for f in os.listdir(os.path.join(in_dir, harvest_dir)):
			if f == '.DS_Store':
				continue
			with open(os.path.join(in_dir, harvest_dir, f), 'rb') as inf:
				record = etree.parse(inf)
				root = record.getroot()
				nsmap = root.nsmap
				if inst.startswith('met'):
					if root.xpath('dc:rights', namespaces=nsmap):
						if root.xpath('dc:format', namespaces=nsmap):
							identifiers = root.xpath('dc:identifier', namespaces=nsmap)
							for field in identifiers:
								value = field.text
								if value is None:
									continue
								if value.startswith('http'):
									recid = '{}_{}_{}'.format(inst, value.split('/')[-3], value.split('/')[-1])
									outname = '{}.xml'.format(recid)
									with open(os.path.join(date_dir, outname), 'wb') as outf:
										record.write(outf, encoding='UTF-8')
									print('Created source record {}'.format(os.path.join(date_dir, outname)))
				elif inst.startswith('malaga'):
					identifiers = root.xpath('dcvalue[@element=\'identifier\'][@qualifier=\'uri\']', namespaces=nsmap)
					for field in identifiers:
						value = field.text
						if value is None:
							continue
						recid = '{}_{}_{}'.format(inst, value.split('/')[-2], value.split('/')[-1])
						outname = '{}.xml'.format(recid)
						with open(os.path.join(date_dir, outname), 'wb') as outf:
							record.write(outf, encoding='UTF-8')
						print('Created source record {}'.format(os.path.join(date_dir, outname)))
				else:
					identifiers = root.xpath('dc:identifier', namespaces=nsmap)
					for field in identifiers:
						value = field.text
						if value is None:
							continue
						if value.startswith('http'):
							if inst.startswith('wolf'):
								f = f.rstrip('_')
								recid = '{}_{}'.format(inst, f.split('_')[-1])
							elif inst.startswith('clark'):
								recid = '{}_{}_{}'.format(inst, value.split('/')[-3], value.split('/')[-1])
							else:
								recid = value.split('/')[-1]
								if recid == 'date':
									recid = '{}_{}'.format(inst, value.split('/')[-2])
								else:
									recid = '{}_{}'.format(inst, recid)
							outname = '{}.xml'.format(recid)
							with open(os.path.join(date_dir, outname), 'wb') as outf:
								record.write(outf, encoding='UTF-8')
							print('Created source record {}'.format(os.path.join(date_dir, outname)))

def create_source_mets(data_path):
	in_dir = os.path.join(data_path, 'contributed_data/mets_data')
	for harvest_dir in os.listdir(in_dir):
		if harvest_dir == '.DS_Store':
			continue
		inst = harvest_dir.split('_')[0]
		idate = harvest_dir.split('_')[-1]
		inst_dir = os.path.join(data_path, 'source_data', inst)
		if not os.path.isdir(inst_dir):
			os.mkdir(inst_dir)
		date_dir = os.path.join(inst_dir, idate)
		if not os.path.isdir(date_dir):
			os.mkdir(date_dir)
		for f in os.listdir(os.path.join(in_dir, harvest_dir)):
			if f == '.DS_Store':
				continue
			with open(os.path.join(in_dir, harvest_dir, f), 'r') as inf:
				if inst.startswith('hertz'):
					string_data = inf.read().replace('xsi:schemaLocation="http://www.loc.gov/METS/ http://www.loc.gov/mets/mets.xsd http://www.loc.gov/mods/v3 http://www.loc.gov/standards/mods/v3/mods-3-2.xsd"', 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.loc.gov/METS/ http://www.loc.gov/mets/mets.xsd http://www.loc.gov/mods/v3 http://www.loc.gov/standards/mods/v3/mods-3-2.xsd"')
					record = etree.fromstring(string_data)
					record = record.getroottree()
					root = record.getroot()
					nsmap = root.nsmap
					identifiers = root.xpath('METS:dmdSec[1]/METS:mdWrap/METS:xmlData/mods:mods/mods:identifier[@type=\'urn\']', namespaces=nsmap)
					for field in identifiers:
						value = field.text
						if value is None:
							continue
						recid = '{}_{}'.format(inst, value)
						outname = '{}.xml'.format(recid)
						with open(os.path.join(date_dir, outname), 'wb') as outf:
							record.write(outf, encoding='UTF-8')
						print('Created source record {}'.format(os.path.join(date_dir, outname)))
				else:
					record = etree.parse(inf)
					root = record.getroot()
					nsmap = root.nsmap
					if inst.startswith('hkhi'):
						names = {'mets': 'http://www.loc.gov/METS/', 'mods': 'http://www.loc.gov/mods/v3', 'dlc': 'http://dlc.mpdl.mpg.de/v1'}
						cmodel = root.xpath('mets:dmdSec[1]/mets:mdWrap/mets:xmlData/mods:mods/mods:extension/dlc:cModel', namespaces=names)[0]
						if cmodel.text == 'DLC Monograph':
							nsmap['mods'] = 'http://www.loc.gov/mods/v3'
							identifiers = root.xpath('mets:dmdSec[1]/mets:mdWrap/mets:xmlData/mods:mods/mods:identifier[@type=\'uri\']', namespaces=nsmap)
							for field in identifiers:
								value = field.text
								if value is None:
									continue
								recid = 'khi_{}'.format(value.strip().split('/')[-2].split(':')[-1])
								outname = '{}.xml'.format(recid)
								with open(os.path.join(date_dir, outname), 'wb') as outf:
									record.write(outf, encoding='UTF-8')
								print('Created source record {}'.format(os.path.join(date_dir, outname)))
					elif inst.startswith('khi'):
						identifiers = root.xpath('METS:dmdSec[1]/METS:mdWrap/METS:xmlData/mods:mods/mods:identifier[@type=\'uri\']', namespaces=nsmap)
						for field in identifiers:
							value = field.text
							if value is None:
								continue
							recid = '{}_{}'.format(inst, value.strip().split('/')[-1].split('.')[-2])
							outname = '{}.xml'.format(recid)
							with open(os.path.join(date_dir, outname), 'wb') as outf:
								record.write(outf, encoding='UTF-8')
							print('Created source record {}'.format(os.path.join(date_dir, outname)))
					elif inst.startswith('uh'):
						identifiers = root.xpath('mets:dmdSec[1]/mets:mdWrap/mets:xmlData/mods:mods/mods:identifier[@type=\'urn\']', namespaces=nsmap)
						for field in identifiers:
							value = field.text
							if value is None:
								continue
							recid = '{}_{}'.format(inst, value)
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
	create_source(settings.TEST_DATA)
	#create_source(settings.PRODUCTION_DATA)
	create_index(settings.LOCAL)
	process_data(settings.TEST_DATA, settings.LOCAL)


if __name__ == '__main__':
	main()