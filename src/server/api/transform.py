def dc_export(response):
	dublin_core = {}

	source = response['_source']
	metadata_rec = source['dublin_core']

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

	return dublin_core

def unqualified_field(field, values, dublin_core):
	fields = []
	for item in values:
		value = item['value']
		fields.append(value)

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

	if len(fields) == 1:
		dublin_core[field] = fields[0]
	elif len(fields) > 1:
		dublin_core[field] = fields

	return dublin_core

def qualified_field(qualifier, item, dublin_core):
	qualified_fields = []
	value = item['value']
	qualified_fields.append(value)

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
		dublin_core['dateCopyrighted'] = datesCopyrighted[0]
	elif len(datesCopyrighted) > 1:
		dublin_core['dateCopyrighted'] = datesCopyrighted

	if len(dates) == 1:
		dublin_core['date'] = dates[0]
	elif len(dates) > 1:
		dublin_core['date'] = dates

	return dublin_core


	