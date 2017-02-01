import os

from pymarc import MARCReader, XmlHandler, parse_xml
from lxml import etree



def fix_lbi(inf, supplied_dir):
	string_data = inf.read().replace(b' xmlns="http://www.loc.gov/MARC21/slim"', b'')
	root = etree.fromstring(string_data)
	for bad in root.xpath('//controlfield[@tag=\'FMT\']'):
		bad.getparent().remove(bad)
	for bad in root.xpath('//controlfield[@tag=\'LDR\']'):
		bad.getparent().remove(bad)
	record = etree.ElementTree(root)
	print(record)
	temp_path = os.path.join(supplied_dir, 'temp.xml')
	with open(temp_path, 'wb') as temp:
		record.write(temp, encoding='UTF-8', pretty_print=True)
	return temp_path

def get_marc_list_xml(f):
	handler = XmlHandler(normalize_form='NFKC')
	parse_xml(f, handler)
	marc_list = handler.records
	return marc_list

def get_marc_list_mrc(f):
	inf = open(f, 'rb')
	inf = inf.read()
	marc_list = MARCReader(inf, to_unicode=True)
	return marc_list

def get_marc_id(inst, record):
	if inst == 'warburg' or inst == 'artic':
		ident = record['907']['a']
	else:
		ident = record['001'].format_field()
	ident = ident.lstrip('.')
	recid = '{}_{}'.format(inst, ident)
	return recid

def get_met_id(record, root, nsmap):
	if root.xpath('dc:rights', namespaces=nsmap) and root.xpath('dc:format', namespaces=nsmap):
		identifiers = root.xpath('dc:identifier', namespaces=nsmap)
		for field in identifiers:
			value = field.text
			if value is None:
				continue
			if value.startswith('http'):
				ident = '{}_{}'.format(value.split('/')[-3], value.split('/')[-1])
				return ident

def get_malaga_id(record, root, nsmap):
	identifiers = root.xpath('dcvalue[@element=\'identifier\'][@qualifier=\'uri\']', namespaces=nsmap)
	if len(identifiers) > 0:
		value = identifiers[0].text
		ident = '{}_{}'.format(value.split('/')[-2], value.split('/')[-1])
		return ident

def get_dc_id(inst, f, record, root, nsmap):
	identifiers = root.xpath('dc:identifier', namespaces=nsmap)
	for field in identifiers:
		value = field.text
		if value is None:
			continue
		if value.startswith('http'):
			if inst == 'wolf':
				f = f.rstrip('_')
				ident = f.split('_')[-1]
			elif inst == 'clark':
				ident = '{}_{}'.format(value.split('/')[-3], value.split('/')[-1])
			else:
				ident = value.split('/')[-1]
				if ident == 'date':
					ident = value.split('/')[-2]
			return ident

def get_mets_rec(inst, inf):
	if inst == 'hertz':
		string_data = inf.read().replace('xsi:schemaLocation="http://www.loc.gov/METS/ http://www.loc.gov/mets/mets.xsd http://www.loc.gov/mods/v3 http://www.loc.gov/standards/mods/v3/mods-3-2.xsd"', 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.loc.gov/METS/ http://www.loc.gov/mets/mets.xsd http://www.loc.gov/mods/v3 http://www.loc.gov/standards/mods/v3/mods-3-2.xsd"')
		record = etree.fromstring(string_data)
		record = record.getroottree()
	else:
		record = etree.parse(inf)
	return record

def get_hkhi_id(record, root, nsmap):
	names = {'mets': 'http://www.loc.gov/METS/', 'mods': 'http://www.loc.gov/mods/v3', 'dlc': 'http://dlc.mpdl.mpg.de/v1'}
	cmodel = root.xpath('mets:dmdSec[1]/mets:mdWrap/mets:xmlData/mods:mods/mods:extension/dlc:cModel', namespaces=names)[0]
	if cmodel.text == 'DLC Monograph':
		nsmap['mods'] = 'http://www.loc.gov/mods/v3'
		identifiers = root.xpath('mets:dmdSec[1]/mets:mdWrap/mets:xmlData/mods:mods/mods:identifier[@type=\'uri\']', namespaces=nsmap)
		if len(identifiers) > 0:
			value = identifiers[0].text
			ident = value.strip().split('/')[-2].split(':')[-1]
			return ident

def get_khi_id(record, root, nsmap):
	identifiers = root.xpath('METS:dmdSec[1]/METS:mdWrap/METS:xmlData/mods:mods/mods:identifier[@type=\'uri\']', namespaces=nsmap)
	if len(identifiers) > 0:
		value = identifiers[0].text
		ident = value.strip().split('/')[-1].split('.')[-2]
		return ident

def get_mets_id(record, root, nsmap, prefix):
	id_path = '{}:dmdSec[1]/{}:mdWrap/{}:xmlData/mods:mods/mods:identifier[@type=\'urn\']'.format(prefix, prefix, prefix)
	identifiers = root.xpath(id_path, namespaces=nsmap)
	if len(identifiers) > 0:
		ident = identifiers[0].text
		ident = ident.rstrip(':')
		return ident

