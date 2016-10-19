import json

def create_sort_query(sort):
    valid_sorts = {'date_added': {'_ingest_date': {'order': 'desc'}},
                    'title_asc': '_title_display.sort',
                    'title_desc': {'_title_display.sort': {'order': 'desc'}},
                    'date_asc': '_date_facet',
                    'date_desc': {'_date_facet': {'order': 'desc'}}}
    if sort:
        return valid_sorts.get(sort[0], [])
    else:
        return []

def create_date_query(from_date, to_date):
    if from_date:
        date_gte = from_date[0]
    else:
        date_gte = None
    if to_date:
        date_lte = to_date[0]
    else:
        date_lte = None
    return {'range': {'_date_facet': {'gte': date_gte,
                                      'lte': date_lte}}}

def create_facet_filters(category, facets):
    filters = []
    keys = {'creator': '_creator_facet.raw',
            'subject': '_subject_facets.raw',
            'grp_contributor': '_grp_contributor.raw',
            'language': '_language'}
    key = keys.get(category)
    if key:
        filters = [{'term': {key: facet}} for facet in facets]
    return {'bool': {'should': filters}}

def create_advanced_filters(field, terms):
    fields = {'adv_grp_contributor': ['_grp_contributor', '_grp_contributor.folded', '_grp_contributor.stemmed'],
              'adv_date': ['_date_facet.folded', '_date_facet.stemmed', 'dublin_core.date.value', 'dublin_core.date.value.folded', 'dublin_core.date.value.stemmed'],
              'adv_language': ['dublin_core.language.value', 'dublin_core.language.value.folded', 'dublin_core.language.value.stemmed'],
              'adv_title': ['dublin_core.title.value', 'dublin_core.title.value.folded', 'dublin_core.title.value.stemmed'],
              'adv_subject': ['dublin_core.subject.value', 'dublin_core.subject.value.folded', 'dublin_core.subject.value.stemmed'],
              'adv_creator': ['dublin_core.creator.value', 'dublin_core.creator.value.folded', 'dublin_core.creator.value.stemmed', 'dublin_core.contributor.value', 'dublin_core.contributor.value.folded', 'dublin_core.contributor.value.stemmed']}
    field_term = fields.get(field)
    filters = []
    for term in terms:
        filter = {'query_string': {'query': term,
                                   'minimum_should_match': '2<-1 5<75%',
                                   'fields': field_term}}
        filters.append(filter)
    return filters

def create_base_query():
    query = {'query': {'bool': {'must': {},
                                'filter': {'bool': {'must': [],
                                                    'filter': []}}}},
             'aggregations': {'creator': {'filter': {'bool': {'must': []}},
                                          'aggs': {'creator':
                                                       {'terms': {'field': '_creator_facet.raw', 'size': 1000}}}},
                              'language': {'filter': {'bool': {'must': []}},
                                           'aggs': {'language':
                                                        {'terms': {'field': '_language', 'size': 1000}}}},
                              'grp_contributor': {'filter': {'bool': {'must': []}},
                                                  'aggs': {'grp_contributor':
                                                               {'terms': {'field': '_grp_contributor.raw', 'size': 1000}}}},
                              'subject': {'filter': {'bool': {'must': []}},
                                          'aggs': {'subject':
                                                       {'terms': {'field': '_subject_facets.raw', 'size': 1000}}}}}}
    return query

def create_query_string(q):
    if q and len(q):
        queries = []
        escape_table = str.maketrans({'+': r'\+',
                                      '-': r'\-',
                                      '=': r'\=',
                                      '&': r'\&',
                                      '|': r'\|',
                                      '>': r'\>',
                                      '<': r'\<',
                                      '!': r'\!',
                                      '(': r'\(',
                                      ')': r'\)',
                                      '{': r'\{',
                                      '}': r'\}',
                                      '[': r'\[',
                                      ']': r'\]',
                                      '^': r'\^',
                                      '"': r'\"',
                                      '~': r'\~',
                                      '*': r'\*',
                                      ':': r'\:',
                                      '\\': r'\\',
                                      '/': r'\/'
                                      })
        for query_term in q:
            escaped_term = query_term.translate(escape_table)
            queries.append(escaped_term)
        query = " ".join(queries)

        return {'query_string': {'query': query,
                                 'minimum_should_match': '2<-1 5<75%',
                                 'fields': ['_record_link',
                                                '_language',
                                                '_language.folded',
                                                '_language.stemmed',
                                                '_title_display^18',
                                                '_title_display.folded^18',
                                                '_title_display.stemmed^18',
                                                '_subject_facets^15',
                                                '_subject_facets.folded^15',
                                                '_subject_facets.stemmed^15',
                                                '_creator_display',
                                                '_creator_display.folded',
                                                '_creator_display.stemmed',
                                                '_creator_facet^12',
                                                '_creator_facet.folded^12',
                                                '_creator_facet.stemmed^12',
                                                '_contributor_display',
                                                '_contributor_display.folded',
                                                '_contributor_display.stemmed',
                                                '_date_facet.folded',
                                                '_date_facet.stemmed',
                                                '_date_display',
                                                '_date_display.folded',
                                                '_date_display.stemmed',
                                                '_grp_contributor',
                                                '_grp_contributor.folded',
                                                '_grp_contributor.stemmed',
                                                '_grp_id',
                                                '_edition',
                                                '_edition.folded',
                                                '_edition.stemmed',
                                                '_series',
                                                '_series.folded',
                                                '_series.stemmed',
                                                'dublin_core.identifier.value',
                                                'dublin_core.identifier.value.folded',
                                                'dublin_core.identifier.value.stemmed',
                                                'dublin_core.creator.value',
                                                'dublin_core.creator.value.folded',
                                                'dublin_core.creator.value.stemmed',
                                                'dublin_core.date.value',
                                                'dublin_core.date.value.folded',
                                                'dublin_core.date.value.stemmed',
                                                'dublin_core.publisher.value',
                                                'dublin_core.publisher.value.folded',
                                                'dublin_core.publisher.value.stemmed',
                                                'dublin_core.format.value',
                                                'dublin_core.format.value.folded',
                                                'dublin_core.format.value.stemmed',
                                                'dublin_core.type.value',
                                                'dublin_core.type.value.folded',
                                                'dublin_core.type.value.stemmed',
                                                'dublin_core.description.value',
                                                'dublin_core.description.value.folded',
                                                'dublin_core.description.value.stemmed',
                                                'dublin_core.provenance.value',
                                                'dublin_core.provenance.value.folded',
                                                'dublin_core.provenance.value.stemmed',
                                                'dublin_core.language.value',
                                                'dublin_core.language.value.folded',
                                                'dublin_core.language.value.stemmed',
                                                'dublin_core.subject.value',
                                                'dublin_core.subject.value.folded',
                                                'dublin_core.subject.value.stemmed',
                                                'dublin_core.coverage.value',
                                                'dublin_core.coverage.value.folded',
                                                'dublin_core.coverage.value.stemmed',
                                                'dublin_core.title.value',
                                                'dublin_core.title.value.folded',
                                                'dublin_core.title.value.stemmed',
                                                'dublin_core.contributor.value',
                                                'dublin_core.contributor.value.folded',
                                                'dublin_core.contributor.value.stemmed',
                                                'dublin_core.relation.value',
                                                'dublin_core.relation.value.folded',
                                                'dublin_core.relation.value.stemmed',
                                                'dublin_core.source.value',
                                                'dublin_core.source.value.folded',
                                                'dublin_core.source.value.stemmed',
                                                'dublin_core.rights.value',
                                                'dublin_core.rights.value.folded',
                                                'dublin_core.rights.value.stemmed',
                                                'dublin_core.accrualMethod.value',
                                                'dublin_core.accrualMethod.value.folded',
                                                'dublin_core.accrualMethod.value.stemmed',
                                                'dublin_core.accrualPeriodicity.value',
                                                'dublin_core.accrualPeriodicity.value.folded',
                                                'dublin_core.accrualPeriodicity.value.stemmed',
                                                'dublin_core.audience.value',
                                                'dublin_core.audience.value.folded',
                                                'dublin_core.audience.value.stemmed']}}
    else:
        return {'match_all': {}}

def create_multisearch(body, start, size, filters):
    index = {'index': 'portal', 'doc_type': 'book'}
    query = [index,
             {'size': size[0],
              'from': start[0],
              'query': body.get('query'),
              'sort': body.get('sort')},
             index,
             {'size': 0,
              'query': {'bool': {'must': body['query']['bool']['must'],
                                 'filter': {'bool': {'must': filters}}}},
              'aggregations': body['aggregations']}]

    request = [json.dumps(item) for item in query]
    return ' \n'.join(request)