import json
import unicodedata

from rest_framework import renderers

from api import transform


RIS_MAP = {
	'Collection': 'AGGR',
	'Dataset': 'DATA',
	'Event': 'GEN',
	'Image': 'ART',
	'Interactive Resource': 'GEN',
	'Moving Image': 'ADVS',
	'Physical Object': 'GEN',
	'Service': 'GEN',
	'Software': 'COMP',
	'Sound': 'SOUND',
	'Still Image': 'ART',
	'Text': 'BOOK'
}

class RawRenderer(renderers.BaseRenderer):
	media_type = 'application/json'
	format = 'raw'

	def render(self, data, media_type=None, renderer_context=None):
		return json.dumps(data, ensure_ascii=False)

class JSONDCRenderer(renderers.BaseRenderer):
	media_type = 'application/json'
	format = 'json'

	def render(self, data, media_type=None, renderer_context=None):
		dc_data = transform.dc_export(data)
		return json.dumps(dc_data, ensure_ascii=False)

class XMLDCRenderer(renderers.BaseRenderer):
	media_type = 'application/xml'
	format = 'xml'

	def render(self, data, media_type=None, renderer_context=None):
		dc_data = transform.dc_export(data)
		dc_xml = transform.json_to_xml(dc_data)
		return dc_xml

class RISRenderer(renderers.BaseRenderer):
	media_type = 'application/x-research-info-systems'
	format = 'ris'

	def render(self, data, media_type=None, renderer_context=None):
		ris_data = []
		ty = type_map(data)
		ris_export(data, ris_data)
		er = 'ER  - \r\n'
		ris = ''.join(ris_data)
		ris = '{}{}{}'.format(ty, ris, er)
		return ris.encode(self.charset)

def ris_export(data, ris_data):
	rec = data['_source']
	for key, values in rec.items():
		if key == 'dublin_core':
			dc_rec = values
			for k, vals in dc_rec.items():
				if k == 'description':
					description(vals, ris_data)
				elif k == 'publisher':
					publisher(vals, ris_data)
				elif k == 'date':
					pub_year(vals, ris_data)
				elif k == 'identifier':
					record_links(vals, ris_data)
		elif key == '_title_display':
			tag_name = 'TI'
			top_level_data(tag_name, values, ris_data)
		elif key == '_creator_display':
			tag_name = 'AU'
			top_level_data(tag_name, values, ris_data)
		elif key == '_edition':
			tag_name = 'ET'
			top_level_data(tag_name, values, ris_data)
		elif key == '_subject_facets':
			tag_name = 'KW'
			top_level_data(tag_name, values, ris_data)
		elif key == '_language':
			tag_name = 'LA'
			top_level_data(tag_name, values[0], ris_data)

	return ris_data

def type_map(data):
	values = data['_source']['dublin_core']['type']
	dcmi_types = []
	for item in values:
		if 'encoding' in item:
			if item['encoding'] == 'DCMI Type Vocabulary':
				value = item['value']
				dcmi_types.append(value)

	if len(dcmi_types) == 0:
		ty = 'TY  - BOOK\r\n'
	else:
		value = dcmi_types[0]
		ris_value = RIS_MAP[value]
		ty = 'TY  - {}\r\n'.format(ris_value)
	
	return ty

def top_level_data(tag_name, values, ris_data):
	if isinstance(values, str):
		tag = '{}  - {}\r\n'.format(tag_name, values)

		ris_data.append(tag)
		return ris_data
	else:
		for item in values:
			tag = '{}  - {}\r\n'.format(tag_name, item)

			ris_data.append(tag)
		return ris_data

def description(values, ris_data):
	abstracts = []
	descriptions = []
	for item in values:
		if 'qualifier' in item:
			if item['qualifier'] == 'abstract':
				value = item['value']
				abstracts.append(value)
			else:
				value = item['value']
				descriptions.append(value)
		else:
			value = item['value']
			descriptions.append(value)

	if len(abstracts) > 0:
		value = abstracts[0]
		ab = 'AB  - {}\r\n'.format(value)
		ris_data.append(ab)

	if len(descriptions) > 0:
		value = '; '.join(descriptions)
		n1 = 'N1  - {}\r\n'.format(value)
		ris_data.append(n1)

	return ris_data

def publisher(values, ris_data):
	value = values[0]['value']
	pb = 'PB  - {}\r\n'.format(value)
	ris_data.append(pb)

	return ris_data

def pub_year(values, ris_data):
	pub_dates = []
	for item in values:
		if 'qualifier' in item:
			if item['qualifier'] == 'issued':
				value = item['value']
				pub_dates.append(value)

	if len(pub_dates) > 0:
		value = pub_dates[0]
		py = 'PY  - {}///\r\n'.format(value)
		ris_data.append(py)

	return ris_data

def record_links(values, ris_data):

	for item in values:
		if 'encoding' in item:
			if item['encoding'] == 'URI':
				value = item['value']
				ur = 'UR  - {}\r\n'.format(value)
				ris_data.append(ur)

	return ris_data


