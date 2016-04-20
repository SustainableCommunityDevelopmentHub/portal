/* jshint node: true */
/* global inject */

describe('FacetService Unit Tests', function(){
  var FacetService;

  beforeEach(function(){
    module('ui.router');
    module('ui.bootstrap');
    module('elasticsearch');
    module('app.core');
    module('app');
    module('app.search');
  });

  beforeEach(inject(function(_FacetService ){
    FacetService = _FacetService;
  }));
});
