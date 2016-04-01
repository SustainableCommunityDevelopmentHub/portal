//search-sort.spec.js
'use strict';

var ResultsPage = require('../page_objects/results.page.js');

describe('Search Results Page Sorting', function() {
  var resultsPage;

  function getDates(hits){
    var dates = [];
    for(var i = 0; i < hits.length; i++){
      dates.push(hits[i]._date_facet);
    }
    return dates;
  }

  function getTitles(hits){
    var titles = [];
    for(var i = 0; i < hits.length; i++){
      titles.push(hits[i]._title_display);
    }
    return titles;
  }

  beforeEach(function() {
    resultsPage = new ResultsPage();
    resultsPage.submitNewSearchTerm('painting');
  });


  it('Should have 6 sorting options in dropdown list', function() {
    expect(resultsPage.sortOptions.count()).toEqual(6);
  });

  it('Should sort by publication date', function() {
    resultsPage.selectSortOption('Date (ascending)');
    resultsPage.getHitsDates().then(function(dates){
      expect(dates.length).toEqual(24);
      expect(dates).toEqual(dates.sort());
    });
  });

  it('Should have correct value for sort in URL query string', function() {
    resultsPage.selectSortOption('Date (ascending)');
    resultsPage.getQueryString().then(function(queryString){
      expect(queryString.split('&sort=')[1]).toEqual('date_asc');
    });
  });

  it('Should have correct text in sort button', function() {
    resultsPage.selectSortOption('Date (ascending)');
    expect(resultsPage.getSortButtonText()).toEqual('Sort by: Date (ascending)');
  });

  it('Should sort by publication date descending', function() {
    resultsPage.selectSortOption('Date (descending)');
    resultsPage.getHitsDates().then(function(dates){
      expect(dates.length).toEqual(24);
      expect(dates).toEqual(dates.sort().reverse());
    });
  });

  it('Should sort by newly added first', function() {
    resultsPage.selectSortOption('Newly Added First');
    resultsPage.getHitsIngestDates().then(function(dates){
      expect(dates.length).toEqual(24);
      expect(dates).toEqual(dates.sort());
    });
  });

  it('Should sort by title', function() {
    resultsPage.selectSortOption('Title: A-Z');
    resultsPage.getHitsTitles().then(function(titles){
      expect(titles.length).toEqual(24);
      expect(titles).toEqual(titles.sort());
    });
  });

  it('Should sort by title Z-A', function() {
    resultsPage.selectSortOption('Title: Z-A');
    resultsPage.getHitsTitles().then(function(titles){
      expect(titles.length).toEqual(24);
      expect(titles).toEqual(titles.sort().reverse());
    });
  });

});
