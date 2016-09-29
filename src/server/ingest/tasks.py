import os
import argparse
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

SAMPLE_DATA = [
	'bnf',
	'inha',
	'malaga',
	'met',
	'uh'
]

class Contribution(object):

	def __init__(self, data_path, metadata_type, in_dir, es, update_es=False):
		print(update_es)
		if data_path == 'test':
			self.data_path = settings.TEST_DATA
		elif data_path == 'production':
			self.data_path = settings.PRODUCTION_DATA
		self.metadata_type = metadata_type
		self.supplied_dir = '{}/supplied_data/{}_data/{}'.format(self.data_path, metadata_type, in_dir)
		self.inst = in_dir.split('_')[0]
		self.idate = in_dir.split('_')[-1]
		self.inst_dir = os.path.join(self.data_path, 'source_data', self.inst)
		if not os.path.isdir(self.inst_dir):
			os.mkdir(self.inst_dir)
		self.date_dir = os.path.join(self.inst_dir, self.idate)
		if not os.path.isdir(self.date_dir):
			os.mkdir(self.date_dir)
		if es == 'local':
			self.es = settings.LOCAL
		elif es == 'dev': 
			self.es = settings.DEV
		elif es == 'production':
			self.es = settings.PROD
		self.update_es = update_es

	def create_source_marc(self):
		infs = '{}/*'.format(self.supplied_dir)
		for f in glob(infs):
			marc_list = helpers.get_marc_list(f)
			for record in marc_list:
				recid = helpers.get_marc_id(self.inst, record)
				outname = '{}.mrc'.format(recid)
				try:
					with open(os.path.join(self.date_dir, outname), 'wb') as outf:
						writer = MARCWriter(outf)
						writer.write(record)
					print('Created source record {}'.format(os.path.join(self.date_dir, outname)))
				except UnicodeEncodeError:
					if self.inst == 'gri' and record.leader[9] == ' ':
						record.leader = record.leader[0:9] + 'a' + record.leader[10:]
						with open(os.path.join(self.date_dir, outname), 'wb') as outf:
							writer = MARCWriter(outf)
							writer.write(record)
						print('Created source record {}'.format(os.path.join(self.date_dir, outname)))

	def create_source_dc(self):
		infs = '{}/*'.format(self.supplied_dir)
		for f in glob(infs):
			with open(f, 'rb') as inf:
				record = etree.parse(inf)
				root = record.getroot()
				nsmap = root.nsmap
				if self.inst == 'met':
					ident = helpers.get_met_id(record, root, nsmap)
				elif self.inst == 'malaga':
					ident = helpers.get_malaga_id(record, root, nsmap)
				else:
					ident = helpers.get_dc_id(self.inst, f, record, root, nsmap)
			if ident is not None:
				recid = '{}_{}'.format(self.inst, ident)
				outname = '{}.xml'.format(recid)
				with open(os.path.join(self.date_dir, outname), 'wb') as outf:
					record.write(outf, encoding='UTF-8')
				print('Created source record {}'.format(os.path.join(self.date_dir, outname)))

	def create_source_mets(self):
		infs = '{}/*'.format(self.supplied_dir)
		for f in glob(infs):
			with open(f, 'r') as inf:
				record = helpers.get_mets_rec(self.inst, inf)
				root = record.getroot()
				nsmap = root.nsmap
				if self.inst == 'hertz':
					ident = helpers.get_mets_id(record, root, nsmap, 'METS')
				elif self.inst == 'hkhi':
					ident = helpers.get_hkhi_id(record, root, nsmap)
				elif self.inst == 'khi':
					ident = helpers.get_khi_id(record, root, nsmap)
				elif self.inst.startswith('uh'):
					ident = helpers.get_mets_id(record, root, nsmap, 'mets')
				if ident is not None:
					if self.inst == 'hkhi':
						recid = 'khi_{}'.format(ident)
					else:
						recid = '{}_{}'.format(self.inst, ident)
					outname = '{}.xml'.format(recid)
					with open(os.path.join(self.date_dir, outname), 'wb') as outf:
						record.write(outf, encoding='UTF-8')
					print('Created source record {}'.format(os.path.join(self.date_dir, outname)))

	def process_data(self):	
		fpaths = '{}/*'.format(self.date_dir)
		for fpath in glob(fpaths):
			recid = fpath.split('/')[-1].split('.')[0]
			erec = Record.objects.filter(pk=recid)
			if len(erec) == 0:
				self.process_new_rec(recid, fpath)
			elif len(erec) == 1:
				oldrec = erec[0]
				self.process_dupe_rec(oldrec, recid, fpath)

	def process_new_rec(self, recid, fpath):
		contrib = Contributor.objects.get(pk=self.inst)
		if self.metadata_type == 'marc':
			Record.objects.create(pk=recid, ingest_date=self.idate, contributor=contrib, source_path=fpath, source_schema='MA')
			rec = marc.main(fpath)
		elif self.metadata_type == 'dc':
			Record.objects.create(pk=recid, ingest_date=self.idate, contributor=contrib, source_path=fpath, source_schema='DC')
			rec = dublin_core.main(fpath)
		elif self.metadata_type == 'mets':
			Record.objects.create(pk=recid, ingest_date=self.idate, contributor=contrib, source_path=fpath, source_schema='ME')
			rec = mets.main(fpath)
		if self.es == 'http://local.portal.dev:9200':
			if self.inst == 'gri' and self.idate == '2015-10-19':
				self.load_es(recid, rec)
			elif self.inst in SAMPLE_DATA:
				self.load_es(recid, rec)
		else:
			self.load_es(recid, rec)

	def process_dupe_rec(self, oldrec, recid, fpath):
		print('Duplicate Record Found')
		oldpath = oldrec.source_path
		diff = filecmp.cmp(fpath, oldpath, shallow=False)
		if diff is False:
			print('Update Record in DB\n')
			oldrec.updated_date = self.idate
			oldrec.source_path = fpath
			oldrec.save()
		if diff is False or self.update_es is True:
			print('Update Record in ES\n')
			if self.metadata_type == 'marc':
				rec = marc.main(fpath)
			elif self.metadata_type == 'dc':
				rec = dublin_core.main(fpath)
			elif self.metadata_type == 'mets':
				rec = mets.main(fpath)
			if self.es == 'http://local.portal.dev:9200':
				if self.inst == 'gri' and self.idate == '2015-10-19':
					self.load_es(recid, rec)
				elif self.inst in SAMPLE_DATA:
					self.load_es(recid, rec)
			else:
				self.load_es(recid, rec)
		if diff is True and self.update_es is False:
			print('No Diff, No ES Update, Do Nothing\n')


	def load_es(self, recid, rec):
		ES_DOC = '{}/portal/book/{}'.format(self.es, recid)

		try:
			resp = requests.put(ES_DOC, data=rec.encode('utf-8'))
		except:
			print(recid)
			raise
		print('Uploading {}...{}\n'.format(recid, resp.status_code))



def main():
	parser = argparse.ArgumentParser()
	parser.add_argument('data_path', choices=['test', 'production'])
	parser.add_argument('es', choices=['local', 'dev', 'production'])
	parser.add_argument('metadata_type', choices=['marc', 'dc', 'mets'])
	parser.add_argument('in_dir', help='name of new supplied_data dir')
	parser.add_argument('-u', '--update', dest='update_es', action='store_true', help='reprocess data and push updated doc to ES')
	#parser.add_argument('-u', '--update', dest='update_es', choices=[True, False], default=False, help='reprocess data and push updated doc to ES')

	args = parser.parse_args()

	contribution = Contribution(**vars(args))

	if contribution.metadata_type == 'marc':
		contribution.create_source_marc()
	elif contribution.metadata_type == 'dc':
		contribution.create_source_dc()
	elif contribution.metadata_type == 'mets':
		contribution.create_source_mets()

	contribution.process_data()
	'''job = sys.argv[1]
	data_path = sys.argv[2]
	es = sys.argv[3]
	if job == 'full':
		full_ingest(data_path, es)
	elif job == 'new':
		relative_path = sys.argv[4]
		if len(sys.argv) == 6:
			update_es = sys.argv[5]
		new_ingest(data_path, es, relative_path, update_es=False)'''


if __name__ == '__main__':
	main()