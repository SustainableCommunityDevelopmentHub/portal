def dc_export(response):
	dublin_core = {}

	source = response['_source']
	metadata_rec = source['dublin_core']

	for key, values in metadata_rec.items():
		if key == 'title':
			title(values, dublin_core)
		elif key == 'creator':
			creator(values, dublin_core)
		elif key == 'contributor':
			contributor(values, dublin_core)


	return dublin_core

def title(values, dublin_core):
	titles = []
	alternatives = []
	for item in values:
		if 'qualifier' in item:
			value = item['value']
			alternatives.append(value)
		else:
			value = item['value']
			titles.append(value)
	
	if len(titles) == 1:
		dublin_core['title'] = titles[0]
	elif len(titles) > 1:
		dublin_core['title'] = titles
	if len(alternatives) == 1:
		dublin_core['alternative'] = alternatives[0]
	elif len(alternatives) > 1:
		dublin_core['alternative'] = alternatives

	return dublin_core

def creator(values, dublin_core):
	creators = []
	for item in values:
		value = item['value']
		creators.append(value)

	if len(creators) == 1:
		dublin_core['creator'] = creators[0]
	elif len(creators) > 1:
		dublin_core['creator'] = creators

	return dublin_core

def contributor(values, dublin_core):
	contributors = []
	for item in values:
		value = item['value']
		contributors.append(value)

	if len(contributors) == 1:
		dublin_core['contributor'] = contributors[0]
	elif len(contributors) > 1:
		dublin_core['contributor'] = contributors

	return dublin_core


	