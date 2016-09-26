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

def get_id(inst, record):
	if inst == 'warburg' or inst == 'artic':
		ident = record['907']['a']
	else:
		ident = record['001'].format_field()
	ident = ident.lstrip('.')
	recid = '{}_{}'.format(inst, ident)
	return recid