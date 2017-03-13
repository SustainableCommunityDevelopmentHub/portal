import os
import zipfile
import shutil
from glob import glob
import requests
import filecmp
import datetime
import traceback
import math

from django.db import models
from django.conf import settings
from django.core.paginator import Paginator
from pymarc import MARCWriter, XMLWriter
from lxml import etree
from pytz import timezone

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
	'casa',
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

log_dir = os.path.join(settings.BASE_DIR, '../../logs')
if not os.path.isdir(log_dir):
	os.mkdir(log_dir)
log_path = os.path.join(log_dir, 'error.log')
logf = open(log_path, 'w')

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
	source_top = os.path.join(data_path, 'source_data')
	if not os.path.isdir(source_top):
		os.mkdir(source_top)
	inst_dir = os.path.join(source_top, inst)
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
		if f.endswith('.xml'):
			if inst == 'lbi':
				with open(f, 'rb') as inf:
					print(inst)
					temp = helpers.fix_lbi(inf, supplied_dir)
					print(temp)
					marc_list = helpers.get_marc_list_xml(temp)
				os.remove(temp)
			else:
				marc_list = helpers.get_marc_list_xml(f)
			for record in marc_list:
				recid = helpers.get_marc_id(inst, record)
				outname = '{}.xml'.format(recid)
				try:
					writer = XMLWriter(open(os.path.join(date_dir, outname), 'wb'))
					writer.write(record)
					writer.close()
					print('Created source record {}'.format(os.path.join(date_dir, outname)))
				except UnicodeEncodeError:
					if inst == 'gri' and record.leader[9] == ' ':
						record.leader = record.leader[0:9] + 'a' + record.leader[10:]
						writer = XMLWriter(open(os.path.join(date_dir, outname), 'wb'))
						writer.write(record)
						writer.close()
						print('Created source record {}'.format(os.path.join(date_dir, outname)))
				except Exception as e:
					logf.write('Failed to create source record {}: {}\n'.format(os.path.join(date_dir, outname), traceback.print_exc()))
		else:
			marc_list = helpers.get_marc_list_mrc(f)
			for record in marc_list:
				recid = helpers.get_marc_id(inst, record)
				outname = '{}.mrc'.format(recid)
				try:
					with open(os.path.join(date_dir, outname), 'wb') as outf:
						writer = MARCWriter(outf)
						writer.write(record)
					print('Created source record {}'.format(os.path.join(date_dir, outname)))
				except Exception as e:
					logf.write('Failed to create source record {}: {}\n'.format(os.path.join(date_dir, outname), traceback.print_exc()))
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
			try:
				with open(os.path.join(date_dir, outname), 'wb') as outf:
					record.write(outf, encoding='UTF-8')
				print('Created source record {}'.format(os.path.join(date_dir, outname)))
			except Exception as e:
				logf.write('Failed to create source record {}: {}\n'.format(os.path.join(date_dir, outname), traceback.print_exc()))
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
				try:
					with open(os.path.join(date_dir, outname), 'wb') as outf:
						record.write(outf, encoding='UTF-8')
					print('Created source record {}'.format(os.path.join(date_dir, outname)))
				except Exception as e:
					logf.write('Failed to create source record {}: {}\n'.format(os.path.join(date_dir, outname), traceback.print_exc()))
	archive(data_path, inst, supplied_dir)
	process_data(inst, date_dir, es)

def archive(data_path, inst, supplied_dir):
	archive_top = os.path.join(data_path, 'archived_data')
	if not os.path.isdir(archive_top):
		os.mkdir(archive_top)
	archive_dir = os.path.join(archive_top, inst)
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
		try:
			if len(erec) == 0:
				process_new_rec(inst, recid, idate, fpath, es)
			elif len(erec) == 1:
				oldrec = erec[0]
				if oldrec.updated_date:
					old_date = oldrec.updated_date
				else:
					old_date = oldrec.ingest_date
				idate_obj = datetime.datetime.strptime(idate, '%Y-%m-%d').date()
				if idate_obj >= old_date:
					process_dupe_rec(oldrec, inst, recid, idate, fpath, es)
		except Exception as e:
			logf.write('Failed to transform {}: {}\n'.format(fpath, traceback.print_exc()))

def process_new_rec(inst, recid, idate, fpath, es):
	contrib = Contributor.objects.get(pk=inst)
	if inst in MARC_DATA:
		Record.objects.create(pk=recid, ingest_date=idate, contributor=contrib, source_path=fpath, source_schema='MA')
		rec = marc.main(fpath)
	elif inst in DC_DATA:
		Record.objects.create(pk=recid, ingest_date=idate, contributor=contrib, source_path=fpath, source_schema='DC')
		rec = dublin_core.main(fpath)
		print(rec)
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
	#load_es(recid, rec, es)

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
	#load_es(recid, rec, es)

def load_es(recid, rec, es):
	ES_DOC = '{}/portal/book/{}'.format(es, recid)

	try:
		resp = requests.put(ES_DOC, data=rec.encode('utf-8'))
		resp.raise_for_status()
		return resp
	except requests.exceptions.HTTPError as err:
		logf.write('Uploading {}...{}\n'.format(recid, err))
	except requests.exceptions.RequestException as e:
		logf.write('Uploading {}...{}\n'.format(recid, e))
	print('Uploading {}...{}\n'.format(recid, resp.status_code))

def build_sitemaps():
	client_dir = os.path.join(settings.BASE_DIR, '../client')
	recs = Record.objects.all()
	p = Paginator(recs, 50000)
	ns = {None: 'http://www.sitemaps.org/schemas/sitemap/0.9'}
	index_root = etree.Element('sitemapindex', nsmap=ns)
	index_doc = etree.ElementTree(index_root)
	for pg in p.page_range: 
		root = etree.Element('urlset', nsmap=ns)
		doc = etree.ElementTree(root)
		current = p.page(pg)
		for record in current.object_list:	
			print(record.pk)
			url = etree.SubElement(root, 'url', nsmap=ns)
			loc = etree.SubElement(url, 'loc', nsmap=ns)
			loc.text = 'http://portal.getty.edu/books/{}'.format(record.pk)
			lastmod = etree.SubElement(url, 'lastmod', nsmap=ns)
			if record.updated_date is not None:
				lastmod.text = str(record.updated_date)
			else:
				lastmod.text = str(record.ingest_date)
			priority = etree.SubElement(url, 'priority', nsmap=ns)
			priority.text = '0.8'
		out_fname = 'sitemap-{}.xml.gz'.format(str(pg))
		out_path = os.path.join(client_dir, out_fname)
		doc.write(out_path, xml_declaration=True, encoding='utf-8')

		sitemap = etree.SubElement(index_root, 'sitemap', nsmap=ns)
		index_loc = etree.SubElement(sitemap, 'loc', nsmap=ns)
		index_loc.text = 'http://portal.getty.edu/{}'.format(out_fname)
		index_lastmod = etree.SubElement(sitemap, 'lastmod', nsmap=ns)
		index_lastmod.text = str(datetime.date.today())

	index_fname = os.path.join(client_dir, 'sitemap-index.xml')
	index_doc.write(index_fname, xml_declaration=True, encoding='utf-8')

def build_dump():
	build_set('json')
	build_set('xml')

def build_set(serialization):
	client_dir = os.path.join(settings.BASE_DIR, '../client')
	set_dir = os.path.join(client_dir, '{}_dump'.format(serialization))
	if not os.path.isdir(set_dir):
		os.mkdir(set_dir)
	rs_ns = '{http://www.openarchives.org/rs/terms/}'
	ns = {None: 'http://www.sitemaps.org/schemas/sitemap/0.9', 'rs': 'http://www.openarchives.org/rs/terms/'}
	ln_tag = '{}{}'.format(rs_ns, 'ln')
	md_tag = '{}{}'.format(rs_ns, 'md')
	recs = Record.objects.all()
	p = Paginator(recs, 50000)
	if os.path.isfile(os.path.join(set_dir, 'resourcedump.xml')):
		print('resource dump already exists')
		rd_parser = etree.XMLParser(remove_blank_text=True)
		rd_doc = etree.parse(os.path.join(set_dir, 'resourcedump.xml'), rd_parser)
		rd_root = rd_doc.getroot()
	else:
		rd_root = etree.Element('urlset', nsmap=ns)
		rd_doc = etree.ElementTree(rd_root)
		rd_ln = etree.SubElement(rd_root, ln_tag, rel='up', href='http://portal.getty.edu/{}_dump/capabilitylist.xml'.format(serialization), nsmap=ns)
		rd_time = str(datetime.datetime.now())
		rd_md = etree.SubElement(rd_root, md_tag, capability='resourcedump', at=rd_time, nsmap=ns)
	for pg in p.page_range:
		dump_day = datetime.date.today()
		build_zip(set_dir, dump_day, pg, p, serialization, ns, ln_tag, md_tag)

		rd_url = etree.SubElement(rd_root, 'url', nsmap=ns)
		rd_loc = etree.SubElement(rd_url, 'loc', nsmap=ns)
		rd_loc.text = 'http://portal.getty.edu/{}_dump/resourcedump_{}-part{}.zip'.format(serialization, dump_day, str(pg))
		rd_url_time = str(datetime.datetime.now())
		rd_url_md = etree.SubElement(rd_url, md_tag, type='application/zip', at=rd_url_time, nsmap=ns)
		rd_url_ln = etree.SubElement(rd_url, ln_tag, rel='contents', 
			href='http://portal.getty.edu/{}_dump/resourcedump_{}-part{}/resourcedump_manifest_{}-part{}.xml'.format(serialization, dump_day, str(pg), 
				dump_day, str(pg)), type='application/xml')

	rd_fname = os.path.join(set_dir, 'resourcedump.xml')
	print(etree.tostring(rd_doc, pretty_print=True))
	rd_doc.write(rd_fname, xml_declaration=True, encoding='utf-8', pretty_print=True)

def build_zip(set_dir, dump_day, pg, p, serialization, ns, ln_tag, md_tag):
	rd_dir = os.path.join(set_dir, 'resourcedump_{}-part{}'.format(dump_day, str(pg))) 
	if not os.path.isdir(rd_dir):
		os.mkdir(rd_dir)
	resource_dir = os.path.join(rd_dir, 'resources')
	if not os.path.isdir(resource_dir):
		os.mkdir(resource_dir)
	root = etree.Element('urlset', nsmap=ns)
	doc = etree.ElementTree(root)
	ln = etree.SubElement(root, ln_tag, rel='up', href='http://portal.getty.edu/{}_dump/capabilitylist.xml'.format(serialization), nsmap=ns)
	time = str(datetime.datetime.now())
	md = etree.SubElement(root, md_tag, capability='resourcedump-manifest', at=time, nsmap=ns)
	current = p.page(pg)
	for record in current.object_list:	
		print(record.pk)
		rec_uri = 'http://127.0.0.1:8000/api/book/{}.{}'.format(record.pk, serialization)
		print(rec_uri)
		resp = requests.get(rec_uri)
		if resp.status_code == 200:
			print(resp.content)
			with open(os.path.join(resource_dir, record.pk), 'wb') as rec_out:
				rec_out.write(resp.content)
			url = etree.SubElement(root, 'url', nsmap=ns)
			loc = etree.SubElement(url, 'loc', nsmap=ns)
			loc.text = 'http://127.0.0.1:8000/api/book/{}.{}'.format(record.pk, serialization)
			lastmod = etree.SubElement(url, 'lastmod', nsmap=ns)
			if record.updated_date is not None:
				lastmod.text = str(datetime.datetime.combine(record.updated_date, datetime.datetime.min.time()))
			else:
				lastmod.text = str(datetime.datetime.combine(record.ingest_date, datetime.datetime.min.time()))
			url_md = etree.SubElement(url, md_tag, type='application/{}'.format(serialization), path='/resources/{}'.format(record.pk))
	out_fname = 'resourcedump_manifest_{}-part{}.xml'.format(dump_day, str(pg))
	out_path = os.path.join(rd_dir, out_fname)
	doc.write(out_path, xml_declaration=True, encoding='utf-8', pretty_print=True)
	zipname = '{}.zip'.format(rd_dir)
	with zipfile.ZipFile(zipname, 'w') as rd_zip:
		for dirname, subdirs, files in os.walk(rd_dir):
			for filename in files:
				if dirname.endswith('resources'):
					rd_zip.write(os.path.join(dirname, filename), os.path.join('resources', os.path.basename(filename)))
				else:
					rd_zip.write(os.path.join(dirname, filename), os.path.basename(filename))
	shutil.rmtree(rd_dir)

		






