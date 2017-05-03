import json

from lxml import etree


def dc_export(response):
	dc_wrapper = {}
	dc_wrapper['@context'] = {'dc': 'http://purl.org/dc/elements/1.1/', 'dcterms': 'http://purl.org/dc/terms/'}
	dc_wrapper['@id'] = 'http://portal.getty.edu/books/{}'.format(response['_id'])
	dublin_core = {}
	dc_wrapper['dc:record'] = dublin_core

	metadata_rec = response['_source']['dublin_core']

	unqualified_fields = [
		'creator',
		'contributor',
		'publisher',
		'language',
		'accrualMethod',
		'accrualPeriodicity',
		'audience',
		'provenance',
		'source',
		'subject',
		'type'
	]

	complex_fields = [
		'title',
		'description',
		'identifier',
		'coverage',
		'format',
		'relation',
		'rights'
	]

	for key, values in metadata_rec.items():
		if key in unqualified_fields:
			unqualified_field(key, values, dublin_core)
		elif key in complex_fields:
			complex_field(key, values, dublin_core)
		elif key == 'date':
			date(values, dublin_core)

	return dc_wrapper

def unqualified_field(field, values, dublin_core):
	fields = []
	for item in values:
		value = item['value']
		fields.append(value)
	field = 'dc:{}'.format(field)
	if len(fields) == 1:
		dublin_core[field] = fields[0]
	elif len(fields) > 1:
		dublin_core[field] = fields

	return dublin_core

def complex_field(field, values, dublin_core):
	fields = []
	for item in values:
		if 'qualifier' in item:
			qualifier = item['qualifier']
			qualified_field(qualifier, item, dublin_core)
		else:
			value = item['value']
			fields.append(value)
	field = 'dc:{}'.format(field)
	if len(fields) == 1:
		dublin_core[field] = fields[0]
	elif len(fields) > 1:
		dublin_core[field] = fields

	return dublin_core

def qualified_field(qualifier, item, dublin_core):
	qualified_fields = []
	value = item['value']
	qualified_fields.append(value)
	qualifier = 'dcterms:{}'.format(qualifier)
	if len(qualified_fields) == 1:
		dublin_core[qualifier] = qualified_fields[0]
	elif len(qualified_fields) > 1:
		dublin_core[qualifier] = qualified_fields

	return dublin_core

def date(values, dublin_core):
	dates = []
	datesCopyrighted = []
	for item in values:
		if 'qualifier' in item:
			if item['qualifier'] == 'issued':
				qualified_field('issued', item, dublin_core)
			elif item['qualifier'] == 'created':
				qualified_field('created', item, dublin_core)
			elif item['qualifier'] == 'copyrighted':
				value = item['value']
				datesCopyrighted.append(value)
			elif item['qualifier'] == 'valid':
				qualified_field('valid', item, dublin_core)
			elif item['qualifier'] == 'modified':
				qualified_field('modified', item, dublin_core)
			else:
				value = item['value']
				dates.append(value)
		else:
			value = item['value']
			dates.append(value)

	if len(datesCopyrighted) == 1:
		dublin_core['dcterms:dateCopyrighted'] = datesCopyrighted[0]
	elif len(datesCopyrighted) > 1:
		dublin_core['dcterms:dateCopyrighted'] = datesCopyrighted

	if len(dates) == 1:
		dublin_core['dc:date'] = dates[0]
	elif len(dates) > 1:
		dublin_core['dc:date'] = dates

	return dublin_core

def json_to_xml(dc):
	dc_ns = '{http://purl.org/dc/elements/1.1/}'
	dcterms_ns = '{http://purl.org/dc/terms/}'
	ns = {'dc': 'http://purl.org/dc/elements/1.1/', 'dcterms': 'http://purl.org/dc/terms/'}
	rec = dc['dc:record']
	dc_root = etree.Element('{http://purl.org/dc/elements/1.1/}record', nsmap=ns)
	dc_rec = etree.ElementTree(dc_root)
	for key, value in rec.items():
		if key.startswith('dc:'):
			tag = '{}{}'.format(dc_ns, key.split(':')[-1])
		else:
			tag = '{}{}'.format(dcterms_ns, key.split(':')[-1])
		if type(value) == str:
			elem = etree.SubElement(dc_root, tag, nsmap=ns)
			elem.text = value
		elif type(value) == list:
			for entry in value:
				elem = etree.SubElement(dc_root, tag, nsmap=ns)
				elem.text = entry
	out_xml = etree.tostring(dc_rec, encoding='UTF-8', pretty_print=True, xml_declaration=True)
	return out_xml


