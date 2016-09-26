from pymarc import MARCReader, XmlHandler, parse_xml



def get_marc_list(file_path):
	if file_path.endswith('.xml'):
		handler = XmlHandler()
		parse_xml(file_path, handler)
		marc_list = handler.records
	else:
		inf = open(file_path, 'rb')
		inf = inf.read()
		marc_list = MARCReader(inf, to_unicode=True)
	return marc_list

def get_id(inst, record):
	if inst == 'warburg' or inst == 'artic':
		ident = record['907']['a']
		ident = ident.lstrip('.')
	else:
		ident = record['001'].format_field()
	recid = '{}_{}'.format(inst, ident)
	return recid