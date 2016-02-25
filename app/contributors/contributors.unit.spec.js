describe('Contributors page tests', function() {

	var scope, controller, $state, searchService, dataService, es, esqb, mockInstitutions;

	var contribESQuery = {"index":"portal","type":"book","body":{"aggregations":{"grp_contributor":{"terms":{"field":"_grp_contributor.raw","size":1000,"order":{"_count": "desc"}}}}}};

	var contribResponse = {"took":3,"timed_out":false,"_shards":{"total":5,"successful":5,"failed":0},"hits":{"total":446,"max_score":1,"hits":[{"_index":"portal","_type":"book","_id":"AVJ_xvUOduOJMEW3J-pA","_score":1,"_source":{"_grp_type":"Text","_record_link":"http://gallica.bnf.fr/ark:/12148/bpt6k63442429","_ingest_date":"2016-01-25","_language":["French"],"dublin_core":{"type":[{"value":"Text","encoding":"DCMI Type Vocabulary"},{"value":"printed serial"}],"relation":[{"uri":"http://catalogue.bnf.fr/ark:/12148/cb34421972m","value":"Notice du catalogue","encoding":"URI"},{"uri":"http://gallica.bnf.fr/ark:/12148/cb34421972m/date","value":"http://gallica.bnf.fr/ark:/12148/cb34421972m/date","encoding":"URI"}],"source":[{"value":"Bibliothèque nationale de France, département Littérature et art, V-11793"}],"date":[{"value":"1907-03-02"}],"rights":[{"value":"public domain"}],"language":[{"value":"French"}],"format":[{"value":"application/pdf","encoding":"IMT"}],"identifier":[{"value":"http://gallica.bnf.fr/ark:/12148/bpt6k63442429","encoding":"URI"}],"publisher":[{"value":"Gazette des beaux-arts (Paris)"}],"description":[{"value":"1907/03/02 (A1907,N9)."}],"contributor":[{"name":"Houssaye, Édouard. Directeur de publication","value":"Houssaye, Édouard. Directeur de publication"}],"title":[{"value":"La Chronique des arts et de la curiosité : supplément à la Gazette des beaux-arts"}]},"_grp_id":"bnf_bpt6k63442429","_date_facet":"1907","_title_display":"La Chronique des arts et de la curiosité : supplément à la Gazette des beaux-arts","_grp_contributor":"Gallica - Bibliothèque nationale de France","_date_display":"1907-03-02"}},{"_index":"portal","_type":"book","_id":"AVJ_xvUOduOJMEW3J-pD","_score":1,"_source":{"_grp_type":"Text","_record_link":"http://gallica.bnf.fr/ark:/12148/bpt6k63442518","_ingest_date":"2016-01-25","_language":["French"],"dublin_core":{"type":[{"value":"Text","encoding":"DCMI Type Vocabulary"},{"value":"printed serial"}],"relation":[{"uri":"http://catalogue.bnf.fr/ark:/12148/cb34421972m","value":"Notice du catalogue","encoding":"URI"},{"uri":"http://gallica.bnf.fr/ark:/12148/cb34421972m/date","value":"http://gallica.bnf.fr/ark:/12148/cb34421972m/date","encoding":"URI"}],"source":[{"value":"Bibliothèque nationale de France, département Littérature et art, V-11793"}],"date":[{"value":"1907-05-04"}],"rights":[{"value":"public domain"}],"language":[{"value":"French"}],"format":[{"value":"application/pdf","encoding":"IMT"}],"identifier":[{"value":"http://gallica.bnf.fr/ark:/12148/bpt6k63442518","encoding":"URI"}],"publisher":[{"value":"Gazette des beaux-arts (Paris)"}],"description":[{"value":"1907/05/04 (A1907,N18)."}],"contributor":[{"name":"Houssaye, Édouard. Directeur de publication","value":"Houssaye, Édouard. Directeur de publication"}],"title":[{"value":"La Chronique des arts et de la curiosité : supplément à la Gazette des beaux-arts"}]},"_grp_id":"bnf_bpt6k63442518","_date_facet":"1907","_title_display":"La Chronique des arts et de la curiosité : supplément à la Gazette des beaux-arts","_grp_contributor":"Gallica - Bibliothèque nationale de France","_date_display":"1907-05-04"}},{"_index":"portal","_type":"book","_id":"AVJ_xvUPduOJMEW3J-pO","_score":1,"_source":{"_grp_type":"Text","_record_link":"http://gallica.bnf.fr/ark:/12148/bpt6k63442993","_ingest_date":"2016-01-25","_language":["French"],"dublin_core":{"type":[{"value":"Text","encoding":"DCMI Type Vocabulary"},{"value":"printed serial"}],"relation":[{"uri":"http://catalogue.bnf.fr/ark:/12148/cb34421972m","value":"Notice du catalogue","encoding":"URI"},{"uri":"http://gallica.bnf.fr/ark:/12148/cb34421972m/date","value":"http://gallica.bnf.fr/ark:/12148/cb34421972m/date","encoding":"URI"}],"source":[{"value":"Bibliothèque nationale de France, département Littérature et art, V-11793"}],"date":[{"value":"1895-02-16"}],"rights":[{"value":"public domain"}],"language":[{"value":"French"}],"format":[{"value":"application/pdf","encoding":"IMT"}],"identifier":[{"value":"http://gallica.bnf.fr/ark:/12148/bpt6k63442993","encoding":"URI"}],"publisher":[{"value":"Gazette des beaux-arts (Paris)"}],"description":[{"value":"1895/02/16 (A1895,N7)."}],"contributor":[{"name":"Houssaye, Édouard. Directeur de publication","value":"Houssaye, Édouard. Directeur de publication"}],"title":[{"value":"La Chronique des arts et de la curiosité : supplément à la Gazette des beaux-arts"}]},"_grp_id":"bnf_bpt6k63442993","_date_facet":"1895","_title_display":"La Chronique des arts et de la curiosité : supplément à la Gazette des beaux-arts","_grp_contributor":"Gallica - Bibliothèque nationale de France","_date_display":"1895-02-16"}},{"_index":"portal","_type":"book","_id":"AVJ_xvUPduOJMEW3J-pQ","_score":1,"_source":{"_grp_type":"Text","_record_link":"http://gallica.bnf.fr/ark:/12148/bpt6k63443024","_ingest_date":"2016-01-25","_language":["French"],"dublin_core":{"type":[{"value":"Text","encoding":"DCMI Type Vocabulary"},{"value":"printed serial"}],"relation":[{"uri":"http://catalogue.bnf.fr/ark:/12148/cb34421972m","value":"Notice du catalogue","encoding":"URI"},{"uri":"http://gallica.bnf.fr/ark:/12148/cb34421972m/date","value":"http://gallica.bnf.fr/ark:/12148/cb34421972m/date","encoding":"URI"}],"source":[{"value":"Bibliothèque nationale de France, département Littérature et art, V-11793"}],"date":[{"value":"1895-03-09"}],"rights":[{"value":"public domain"}],"language":[{"value":"French"}],"format":[{"value":"application/pdf","encoding":"IMT"}],"identifier":[{"value":"http://gallica.bnf.fr/ark:/12148/bpt6k63443024","encoding":"URI"}],"publisher":[{"value":"Gazette des beaux-arts (Paris)"}],"description":[{"value":"1895/03/09 (A1895,N10)."}],"contributor":[{"name":"Houssaye, Édouard. Directeur de publication","value":"Houssaye, Édouard. Directeur de publication"}],"title":[{"value":"La Chronique des arts et de la curiosité : supplément à la Gazette des beaux-arts"}]},"_grp_id":"bnf_bpt6k63443024","_date_facet":"1895","_title_display":"La Chronique des arts et de la curiosité : supplément à la Gazette des beaux-arts","_grp_contributor":"Gallica - Bibliothèque nationale de France","_date_display":"1895-03-09"}},{"_index":"portal","_type":"book","_id":"AVJ_xvUPduOJMEW3J-pR","_score":1,"_source":{"_grp_type":"Text","_record_link":"http://gallica.bnf.fr/ark:/12148/bpt6k63443076","_ingest_date":"2016-01-25","_language":["French"],"dublin_core":{"type":[{"value":"Text","encoding":"DCMI Type Vocabulary"},{"value":"printed serial"}],"relation":[{"uri":"http://catalogue.bnf.fr/ark:/12148/cb34421972m","value":"Notice du catalogue","encoding":"URI"},{"uri":"http://gallica.bnf.fr/ark:/12148/cb34421972m/date","value":"http://gallica.bnf.fr/ark:/12148/cb34421972m/date","encoding":"URI"}],"source":[{"value":"Bibliothèque nationale de France, département Littérature et art, V-11793"}],"date":[{"value":"1895-04-13"}],"rights":[{"value":"public domain"}],"language":[{"value":"French"}],"format":[{"value":"application/pdf","encoding":"IMT"}],"identifier":[{"value":"http://gallica.bnf.fr/ark:/12148/bpt6k63443076","encoding":"URI"}],"publisher":[{"value":"Gazette des beaux-arts (Paris)"}],"description":[{"value":"1895/04/13 (A1895,N15)."}],"contributor":[{"name":"Houssaye, Édouard. Directeur de publication","value":"Houssaye, Édouard. Directeur de publication"}],"title":[{"value":"La Chronique des arts et de la curiosité : supplément à la Gazette des beaux-arts"}]},"_grp_id":"bnf_bpt6k63443076","_date_facet":"1895","_title_display":"La Chronique des arts et de la curiosité : supplément à la Gazette des beaux-arts","_grp_contributor":"Gallica - Bibliothèque nationale de France","_date_display":"1895-04-13"}},{"_index":"portal","_type":"book","_id":"AVJ_xvUPduOJMEW3J-pV","_score":1,"_source":{"_grp_type":"Text","_record_link":"http://gallica.bnf.fr/ark:/12148/bpt6k63443180","_ingest_date":"2016-01-25","_language":["French"],"dublin_core":{"type":[{"value":"Text","encoding":"DCMI Type Vocabulary"},{"value":"printed serial"}],"relation":[{"uri":"http://catalogue.bnf.fr/ark:/12148/cb34421972m","value":"Notice du catalogue","encoding":"URI"},{"uri":"http://gallica.bnf.fr/ark:/12148/cb34421972m/date","value":"http://gallica.bnf.fr/ark:/12148/cb34421972m/date","encoding":"URI"}],"source":[{"value":"Bibliothèque nationale de France, département Littérature et art, V-11793"}],"date":[{"value":"1895-07-27"}],"rights":[{"value":"public domain"}],"language":[{"value":"French"}],"format":[{"value":"application/pdf","encoding":"IMT"}],"identifier":[{"value":"http://gallica.bnf.fr/ark:/12148/bpt6k63443180","encoding":"URI"}],"publisher":[{"value":"Gazette des beaux-arts (Paris)"}],"description":[{"value":"1895/07/27 (A1895,N26)."}],"contributor":[{"name":"Houssaye, Édouard. Directeur de publication","value":"Houssaye, Édouard. Directeur de publication"}],"title":[{"value":"La Chronique des arts et de la curiosité : supplément à la Gazette des beaux-arts"}]},"_grp_id":"bnf_bpt6k63443180","_date_facet":"1895","_title_display":"La Chronique des arts et de la curiosité : supplément à la Gazette des beaux-arts","_grp_contributor":"Gallica - Bibliothèque nationale de France","_date_display":"1895-07-27"}},{"_index":"portal","_type":"book","_id":"AVJ_xvUPduOJMEW3J-pb","_score":1,"_source":{"_grp_type":"Text","_record_link":"http://gallica.bnf.fr/ark:/12148/bpt6k63443840","_ingest_date":"2016-01-25","_language":["French"],"dublin_core":{"type":[{"value":"Text","encoding":"DCMI Type Vocabulary"},{"value":"printed serial"}],"relation":[{"uri":"http://catalogue.bnf.fr/ark:/12148/cb34421972m","value":"Notice du catalogue","encoding":"URI"},{"uri":"http://gallica.bnf.fr/ark:/12148/cb34421972m/date","value":"http://gallica.bnf.fr/ark:/12148/cb34421972m/date","encoding":"URI"}],"source":[{"value":"Bibliothèque nationale de France, département Littérature et art, V-11793"}],"date":[{"value":"1902-02-08"}],"rights":[{"value":"public domain"}],"language":[{"value":"French"}],"format":[{"value":"application/pdf","encoding":"IMT"}],"identifier":[{"value":"http://gallica.bnf.fr/ark:/12148/bpt6k63443840","encoding":"URI"}],"publisher":[{"value":"Gazette des beaux-arts (Paris)"}],"description":[{"value":"1902/02/08 (N6)."}],"contributor":[{"name":"Houssaye, Édouard. Directeur de publication","value":"Houssaye, Édouard. Directeur de publication"}],"title":[{"value":"La Chronique des arts et de la curiosité : supplément à la Gazette des beaux-arts"}]},"_grp_id":"bnf_bpt6k63443840","_date_facet":"1902","_title_display":"La Chronique des arts et de la curiosité : supplément à la Gazette des beaux-arts","_grp_contributor":"Gallica - Bibliothèque nationale de France","_date_display":"1902-02-08"}},{"_index":"portal","_type":"book","_id":"AVJ_xvUPduOJMEW3J-pc","_score":1,"_source":{"_grp_type":"Text","_record_link":"http://gallica.bnf.fr/ark:/12148/bpt6k63443877","_ingest_date":"2016-01-25","_language":["French"],"dublin_core":{"type":[{"value":"Text","encoding":"DCMI Type Vocabulary"},{"value":"printed serial"}],"relation":[{"uri":"http://catalogue.bnf.fr/ark:/12148/cb34421972m","value":"Notice du catalogue","encoding":"URI"},{"uri":"http://gallica.bnf.fr/ark:/12148/cb34421972m/date","value":"http://gallica.bnf.fr/ark:/12148/cb34421972m/date","encoding":"URI"}],"source":[{"value":"Bibliothèque nationale de France, département Littérature et art, V-11793"}],"date":[{"value":"1902-03-01"}],"rights":[{"value":"public domain"}],"language":[{"value":"French"}],"format":[{"value":"application/pdf","encoding":"IMT"}],"identifier":[{"value":"http://gallica.bnf.fr/ark:/12148/bpt6k63443877","encoding":"URI"}],"publisher":[{"value":"Gazette des beaux-arts (Paris)"}],"description":[{"value":"1902/03/01 (N9)."}],"contributor":[{"name":"Houssaye, Édouard. Directeur de publication","value":"Houssaye, Édouard. Directeur de publication"}],"title":[{"value":"La Chronique des arts et de la curiosité : supplément à la Gazette des beaux-arts"}]},"_grp_id":"bnf_bpt6k63443877","_date_facet":"1902","_title_display":"La Chronique des arts et de la curiosité : supplément à la Gazette des beaux-arts","_grp_contributor":"Gallica - Bibliothèque nationale de France","_date_display":"1902-03-01"}},{"_index":"portal","_type":"book","_id":"AVJ_xvUPduOJMEW3J-pn","_score":1,"_source":{"_grp_type":"Text","_record_link":"http://gallica.bnf.fr/ark:/12148/bpt6k63447243","_ingest_date":"2016-01-25","_language":["French"],"dublin_core":{"type":[{"value":"Text","encoding":"DCMI Type Vocabulary"},{"value":"printed serial"}],"relation":[{"uri":"http://catalogue.bnf.fr/ark:/12148/cb34421972m","value":"Notice du catalogue","encoding":"URI"},{"uri":"http://gallica.bnf.fr/ark:/12148/cb34421972m/date","value":"http://gallica.bnf.fr/ark:/12148/cb34421972m/date","encoding":"URI"}],"source":[{"value":"Bibliothèque nationale de France, département Littérature et art, V-11793"}],"date":[{"value":"1866-01-14"}],"rights":[{"value":"public domain"}],"language":[{"value":"French"}],"format":[{"value":"application/pdf","encoding":"IMT"}],"identifier":[{"value":"http://gallica.bnf.fr/ark:/12148/bpt6k63447243","encoding":"URI"}],"publisher":[{"value":"Gazette des beaux-arts (Paris)"}],"description":[{"value":"1866/01/14 (A1866,T4,N128)."}],"contributor":[{"name":"Houssaye, Édouard. Directeur de publication","value":"Houssaye, Édouard. Directeur de publication"}],"title":[{"value":"La Chronique des arts et de la curiosité : supplément à la Gazette des beaux-arts"}]},"_grp_id":"bnf_bpt6k63447243","_date_facet":"1866","_title_display":"La Chronique des arts et de la curiosité : supplément à la Gazette des beaux-arts","_grp_contributor":"Gallica - Bibliothèque nationale de France","_date_display":"1866-01-14"}},{"_index":"portal","_type":"book","_id":"AVJ_xvUQduOJMEW3J-pr","_score":1,"_source":{"_grp_type":"Text","_record_link":"http://gallica.bnf.fr/ark:/12148/bpt6k63447369","_ingest_date":"2016-01-25","_language":["French"],"dublin_core":{"type":[{"value":"Text","encoding":"DCMI Type Vocabulary"},{"value":"printed serial"}],"relation":[{"uri":"http://catalogue.bnf.fr/ark:/12148/cb34421972m","value":"Notice du catalogue","encoding":"URI"},{"uri":"http://gallica.bnf.fr/ark:/12148/cb34421972m/date","value":"http://gallica.bnf.fr/ark:/12148/cb34421972m/date","encoding":"URI"}],"source":[{"value":"Bibliothèque nationale de France, département Littérature et art, V-11793"}],"date":[{"value":"1866-04-08"}],"rights":[{"value":"public domain"}],"language":[{"value":"French"}],"format":[{"value":"application/pdf","encoding":"IMT"}],"identifier":[{"value":"http://gallica.bnf.fr/ark:/12148/bpt6k63447369","encoding":"URI"}],"publisher":[{"value":"Gazette des beaux-arts (Paris)"}],"description":[{"value":"1866/04/08 (A1866,T4,N140)."}],"contributor":[{"name":"Houssaye, Édouard. Directeur de publication","value":"Houssaye, Édouard. Directeur de publication"}],"title":[{"value":"La Chronique des arts et de la curiosité : supplément à la Gazette des beaux-arts"}]},"_grp_id":"bnf_bpt6k63447369","_date_facet":"1866","_title_display":"La Chronique des arts et de la curiosité : supplément à la Gazette des beaux-arts","_grp_contributor":"Gallica - Bibliothèque nationale de France","_date_display":"1866-04-08"}}]},"aggregations":{"grp_contributor":{"doc_count_error_upper_bound":0,"sum_other_doc_count":0,"buckets":[{"key":"Gallica - Bibliothèque nationale de France","doc_count":99},{"key":"Heidelberg University Library","doc_count":99},{"key":"Institut National d'Histoire de l'Art","doc_count":98},{"key":"Getty Research Institute","doc_count":83},{"key":"Metropolitan Museum of Art","doc_count":43},{"key":"Universidad de Málaga","doc_count":24}]}}};

	beforeEach(function(){
		module('ui.router');
		module('ui.bootstrap');
		module('elasticsearch');
		module('app.core');
		module('app');
		module('app.search');
		module('app.contributors');
	});


	beforeEach(inject(function($rootScope, $controller, _$state_, SearchService, DataService, esClient, esQueryBuilder){
		dataService = DataService;
		es = esClient;
		$state = _$state_;
		scope = $rootScope.$new();
		searchService = SearchService;
		esqb = esQueryBuilder;

		controller = $controller('ContributorsCtrl', {
			'$scope': scope,
			'$state': $state,
			'DataService': dataService,
			'SearchService': searchService
		});

	}));

	it('exists', function() {
		expect(controller).toBeDefined();
	});

	it('builds correct elasticsearch query for contributors', function(){
  	spyOn(esqb, 'buildContributorsQuery');
    dataService.getContributors();
    expect(esqb.buildContributorsQuery).toHaveBeenCalled();
    
  });

	describe('Tests for building individual contributor queries', function() {

		beforeEach(function(){
			mockInstitutions = contribResponse.aggregations.grp_contributor.buckets;
		});

		it("should call Search Service's reset opts when calling contribSearch", function(){
			spyOn(searchService, 'resetOpts');
			scope.contribSearch({facets: [{facet: 'grp_contributor', option: mockInstitutions[0].key}]});
			expect(searchService.resetOpts).toHaveBeenCalled();
		})

		it("should call Search Service's update opts when calling contribSearch", function(){
		  spyOn(searchService, 'updateOpts');
	    scope.contribSearch({facets: [{facet: 'grp_contributor', option: mockInstitutions[0].key}]});
	    expect(searchService.updateOpts).toHaveBeenCalledWith({facets: [{facet: 'grp_contributor', option: 'Gallica - Bibliothèque nationale de France'}]});
	  });

	  /*it("adds sort object to SearchService's options", function(){
	    scope.setSortMode(scope.validSortModes.titleAZ);
	    expect(searchService.opts.sort).toBeDefined();
	    expect(searchService.opts.sort).toEqual(scope.validSortModes.titleAZ);
	  });*/
	});


	/*it("should call Search Service's update opts when calling contribSearch", function(){
		scope.$broadcast('stateChangeSuccess');
    	spyOn(searchService, 'updateOpts');
    	scope.contribSearch(scope.institutions[0]);
    	expect(searchService.updateOpts).toHaveBeenCalled();
  	});*/

	/*it('should define institutions', function() {
		scope.$broadcast('$stateChangeSuccess');
		var result;
		dataService.getContributors().then(function(contribResults) {
			result = contribResults;
		});
		//var institutions = scope.institutions;
		//expect(institutions).toEqual(result.aggregations.grp_contributor.buckets);
		expect(result).toBeDefined();
	});*/
	/*it("should call Data Service's get contributors upon state change", function(){
		scope.$broadcast('$stateChangeSuccess');
		//scope.$apply();
		spyOn(dataService, 'getContributors');
		expect(dataService.getContributors).toHaveBeenCalled();
	});*/



  

});