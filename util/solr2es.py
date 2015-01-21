import json

from lxml import etree


def solrxml_to_json(inputpath, outputpath):
    docs = []
    with open(inputpath, 'rb') as xml:
        root = etree.fromstring(xml.read())
        doc_elements = root.xpath('//doc')
        for doc_elem in doc_elements:
            doc_dict = {}
            for field in doc_elem.xpath('field'):
                doc_dict[field.get('name')] = field.text
            docs.append(doc_dict)
    with open(outputpath, 'w') as output:
        for doc in docs:
            output.write('{"index": {"_index":"portal", "_type":"book"} }\n')
            output.write('%s\n' % json.dumps(doc))
