//search-sort.spec.js
'use strict';

var ResultsPage = require('../page_objects/results.page.js');

describe('Sorting tests', function() {
  var resultsPage;

  beforeEach(function() {
    resultsPage = new ResultsPage();
    resultsPage.submitNewSearchTerm('painting');
  });


  it('Should have 6 sorting options in dropdown list', function() {
    expect(resultsPage.sortOptions.count()).toEqual(6);
  });

  it('Should sort by publication date', function() {
    resultsPage.selectSortOption('Date (ascending)');
    expect(resultsPage.getHitsDates()).toEqual(resultsPage.getHitsDates().sort());
  });

  it('Should sort by publication date descending', function() {
    resultsPage.selectSortOption('Date (descending)');
    expect(resultsPage.getHitsDates()).toEqual(resultsPage.getHitsDates().sort().reverse());
  });

  it('Should sort by newly added first', function() {
    resultsPage.selectSortOption('Newly Added First');
    expect(resultsPage.getHitsIngestDates()).toEqual(resultsPage.getHitsIngestDates().sort());
  });

  it('Should sort by title', function() {
    resultsPage.selectSortOption('Title: A-Z');
    expect(resultsPage.getHitsTitles()).toEqual(resultsPage.getHitsTitles().sort());
  });

  it('Should sort by title Z-A', function() {
    resultsPage.selectSortOption('Title: Z-A');
    expect(resultsPage.getHitsTitles()).toEqual(resultsPage.getHitsTitles().sort().reverse());
  });

});
