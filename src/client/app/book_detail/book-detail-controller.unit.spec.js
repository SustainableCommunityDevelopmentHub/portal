describe("Book Detail Controller", function(){
  var scope, DataService, SearchService, controller, ADVANCED_SEARCH;

  beforeEach(function(){
    module('ui.router');
    module('ui.bootstrap');
    module('app.core');
    module('app');
    module('app.book-detail');
  });

  beforeEach(inject(function($rootScope, $window, $controller, _DataService_, _SearchService_, _ADVANCED_SEARCH_) {
    scope = $rootScope.$new();
    SearchService = _SearchService_;
    DataService = _DataService_;
    ADVANCED_SEARCH = _ADVANCED_SEARCH_;
    controller = $controller('BookDetailCtrl', {
      '$scope': scope,
      '$window': $window,
      'book': {},
      'DataService': DataService,
      'SearchService': SearchService,
      'ADVANCED_SEARCH': ADVANCED_SEARCH
    });
  }));

  it('should create searches with subject facets', function() {
    scope.searchWithFacet('subject', 'Art');
    expect(SearchService.opts.advancedFields.length).toBe(1);
    var advField = SearchService.buildAdvancedField(ADVANCED_SEARCH['subject'], 'Art');
    expect(SearchService.opts.advancedFields[0]).toEqual(advField);
  });

  it('should create searches with language facets', function() {
    scope.searchWithFacet('language', 'English');
    expect(SearchService.opts.advancedFields.length).toBe(1);
    var advField = SearchService.buildAdvancedField(ADVANCED_SEARCH['language'], 'English');
    expect(SearchService.opts.advancedFields[0]).toEqual(advField);
  });

  it('should create searches with creator facets', function() {
    scope.searchWithFacet('creator', "France. Ministère de l'instruction publique");
    expect(SearchService.opts.advancedFields.length).toBe(1);
    var advField = SearchService.buildAdvancedField(ADVANCED_SEARCH['creator'], "France. Ministère de l'instruction publique");
    expect(SearchService.opts.advancedFields[0]).toEqual(advField);
  });

  it('should create searches with keywords', function() {
    var keyword = 'Houssaye, Édouard. Directeur de publication';
    scope.searchWithKeyword(keyword);
    expect(SearchService.opts.q.length).toBe(1);
    expect(SearchService.opts.q[0]).toEqual(keyword.toLowerCase());
  });

});