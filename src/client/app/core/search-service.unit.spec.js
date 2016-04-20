/* jshint node: true */
/* global inject */

describe('SearchService Unit Tests', function(){
  var SearchService;

  beforeEach(function(){
    module('ui.router');
    module('ui.bootstrap');
    module('elasticsearch');
    module('app.core');
    module('app');
    module('app.search');
  });

  beforeEach(inject(function(_SearchService_ ){
    SearchService = _SearchService_;
  }));

  describe('calculatePage()', function(){
    it('should set page to one after running resetOpts()', function(){
      SearchService.resetOpts();
      expect(SearchService.calculatePage()).toEqual(1);
    });

    it('should correctly set page to 1 if from = 0', function(){
      SearchService.opts = {
        from: 0,
        size: 25
      };
      expect(SearchService.calculatePage()).toEqual(1);
    });

    it('should correctly set page when pageSize=10', function(){
      SearchService.opts = {
        from: 30,
        size: 10
      };
      expect(SearchService.calculatePage()).toEqual(4);
    });
    it('should correctly set page when pageSize=25', function(){
      SearchService.opts = {
        from: 75,
        size: 25
      };
      expect(SearchService.calculatePage()).toEqual(4);
    });
    it('should correctly set page when pageSize=50', function(){
      SearchService.opts = {
        from: 150,
        size: 50
      };
      expect(SearchService.calculatePage()).toEqual(4);
    });
    it('should correctly set page when pageSize=100', function(){
      SearchService.opts = {
        from: 300,
        size: 100
      };
      expect(SearchService.calculatePage()).toEqual(4);
    });
    it('should correctly set page when pageSize > from and does not divide evenly into from', function(){
      SearchService.opts = {
        from: 20,
        size: 25
      };
      expect(SearchService.calculatePage()).toEqual(2);
    });
    it('should correctly set page when pageSize < from and does not divide evenly into from', function(){
      SearchService.opts = {
        from: 25,
        size: 10
      };
      expect(SearchService.calculatePage()).toEqual(4);
    });
  });
});
