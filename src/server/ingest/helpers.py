from pymarc import MARCReader, XmlHandler, parse_xml



def get_marc_list(f):
	if f.endswith('.xml'):
		handler = XmlHandler()
		parse_xml(f, handler)
		marc_list = handler.records
	else:
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
	for field in identifiers:
		value = field.text
		if value is None:
			continue
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

