import os
from glob import glob

from django.conf import settings
from pymarc import MARCReader, XmlHandler, parse_xml, MARCWriter
from lxml import etree



def create_source_marc(data_path):
	in_dir = os.path.join(data_path, 'contributed_data/marc_data')
	for contrib_dir in os.listdir(in_dir):
		if contrib_dir != '.DS_Store':
			inst = contrib_dir.split('_')[0]
			idate = contrib_dir.split('_')[-1]
			inst_dir = os.path.join(data_path, 'source_data', inst)
			if not os.path.isdir(inst_dir):
				os.mkdir(inst_dir)
			date_dir = os.path.join(inst_dir, idate)
			if not os.path.isdir(date_dir):
				os.mkdir(date_dir)
			for f in os.listdir(os.path.join(in_dir, contrib_dir)):
				if f != '.DS_Store':
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
		if harvest_dir != '.DS_Store':
			inst = harvest_dir.split('_')[0]
			idate = harvest_dir.split('_')[-1]
			inst_dir = os.path.join(data_path, 'source_data', inst)
			if not os.path.isdir(inst_dir):
				os.mkdir(inst_dir)
			date_dir = os.path.join(inst_dir, idate)
			if not os.path.isdir(date_dir):
				os.mkdir(date_dir)
			for f in os.listdir(os.path.join(in_dir, harvest_dir)):
				if f != '.DS_Store':
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
										if value is not None:
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
								if value is not None:
									recid = '{}_{}_{}'.format(inst, value.split('/')[-2], value.split('/')[-1])
									outname = '{}.xml'.format(recid)
									with open(os.path.join(date_dir, outname), 'wb') as outf:
										record.write(outf, encoding='UTF-8')
									print('Created source record {}'.format(os.path.join(date_dir, outname)))
						else:
							identifiers = root.xpath('dc:identifier', namespaces=nsmap)
							for field in identifiers:
								value = field.text
								if value is not None:
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
		if harvest_dir != '.DS_Store':
			inst = harvest_dir.split('_')[0]
			idate = harvest_dir.split('_')[-1]
			inst_dir = os.path.join(data_path, 'source_data', inst)
			if not os.path.isdir(inst_dir):
				os.mkdir(inst_dir)
			date_dir = os.path.join(inst_dir, idate)
			if not os.path.isdir(date_dir):
				os.mkdir(date_dir)
			for f in os.listdir(os.path.join(in_dir, harvest_dir)):
				if f != '.DS_Store':
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
								if value is not None:
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
										if value is not None:
											recid = 'khi_{}'.format(value.strip().split('/')[-2].split(':')[-1])
											outname = '{}.xml'.format(recid)
											with open(os.path.join(date_dir, outname), 'wb') as outf:
												record.write(outf, encoding='UTF-8')
											print('Created source record {}'.format(os.path.join(date_dir, outname)))
							elif inst.startswith('khi'):
								identifiers = root.xpath('METS:dmdSec[1]/METS:mdWrap/METS:xmlData/mods:mods/mods:identifier[@type=\'uri\']', namespaces=nsmap)
								for field in identifiers:
									value = field.text
									if value is not None:
										recid = '{}_{}'.format(inst, value.strip().split('/')[-1].split('.')[-2])
										outname = '{}.xml'.format(recid)
										with open(os.path.join(date_dir, outname), 'wb') as outf:
											record.write(outf, encoding='UTF-8')
										print('Created source record {}'.format(os.path.join(date_dir, outname)))
							elif inst.startswith('uh'):
								identifiers = root.xpath('mets:dmdSec[1]/mets:mdWrap/mets:xmlData/mods:mods/mods:identifier[@type=\'urn\']', namespaces=nsmap)
								for field in identifiers:
									value = field.text
									if value is not None:
										recid = '{}_{}'.format(inst, value)
										outname = '{}.xml'.format(recid)
										with open(os.path.join(date_dir, outname), 'wb') as outf:
											record.write(outf, encoding='UTF-8')
										print('Created source record {}'.format(os.path.join(date_dir, outname)))



def main():
	#create_source_marc(settings.TEST_DATA_PATH)
	create_source_marc(settings.PRODUCTION_DATA_PATH)
	#create_source_dc(settings.TEST_DATA_PATH)
	create_source_dc(settings.PRODUCTION_DATA_PATH)
	#create_source_mets(settings.TEST_DATA_PATH)
	create_source_mets(settings.PRODUCTION_DATA_PATH)

if __name__ == '__main__':
	main()