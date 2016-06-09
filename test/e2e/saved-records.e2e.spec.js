// saved-records.e2e.spec.js
'use strict';
/* jshint node: true */
/* jshint jasmine: true */

var ResultsPage = require('../page_objects/results.page.js');
var SavedRecordsPage = require('../page_objects/saved-records.page.js');

describe('Saved Records Page', function() {
  var resultsPage, savedRecordsPage;

  beforeEach(function() {
    resultsPage = new ResultsPage();
    resultsPage.submitNewSearchTerm('art');
  });

  afterEach(function() {
    browser.executeScript(function() {
      window.localStorage.removeItem("getty_portal_records");
      window.localStorage.removeItem("getty_portal_searches");
    });
  });

  it('should display saved records on Saved Records page', function() {
    resultsPage.toggleSavingRecord(0);
    resultsPage.toggleSavingRecord(1);
    resultsPage.toggleSavingRecord(2);

    savedRecordsPage = new SavedRecordsPage();
    savedRecordsPage.getAllRecords().then(function(records) {
      expect(records.length).toBe(3);
    });

    var numRecords = savedRecordsPage.getNumSavedRecords();
    expect(numRecords.getText()).toBe('3');

  });

  it('should sort records by title', function() {
    resultsPage.toggleSavingRecord(0);
    resultsPage.toggleSavingRecord(1);
    resultsPage.toggleSavingRecord(2);

    savedRecordsPage = new SavedRecordsPage();
    savedRecordsPage.selectSortMode(1);
    savedRecordsPage.getAllTitles().then(function(titles) {
      var sortedTitles = titles.sort();
      expect(titles).toEqual(sortedTitles);
    });
  });

  it('should sort records by date ascending', function() {
    resultsPage.toggleSavingRecord(0);
    resultsPage.toggleSavingRecord(1);
    resultsPage.toggleSavingRecord(2);

    savedRecordsPage = new SavedRecordsPage();
    savedRecordsPage.selectSortMode(3);
    savedRecordsPage.getAllDates().then(function(dates) {
      console.log(dates);
      var sortedDates = dates.sort();
      expect(dates).toEqual(sortedDates);
    });
  });

  it('should sort records by date descending', function() {
    resultsPage.toggleSavingRecord(0);
    resultsPage.toggleSavingRecord(1);
    resultsPage.toggleSavingRecord(2);

    savedRecordsPage = new SavedRecordsPage();
    savedRecordsPage.selectSortMode(4);
    savedRecordsPage.getAllDates().then(function(dates) {
      var sortedDates = dates.sort().reverse();
      expect(dates).toEqual(sortedDates);
    });

  });

  it('should remove records from saved records page', function () {
    resultsPage.toggleSavingRecord(0);
    resultsPage.toggleSavingRecord(1);
    resultsPage.toggleSavingRecord(2);

    savedRecordsPage = new SavedRecordsPage();
    savedRecordsPage.clickBookmark(1);
    savedRecordsPage.getAllRecords().then(function(records){
      expect(records.length).toBe(2);
    });
    expect(savedRecordsPage.getNumSavedRecords().getText()).toBe('2');

  });

  it('should show recent searches', function () {
    resultsPage.toggleFacetOption('subject', 'Russia');
    resultsPage.toggleFacetOption('subject', 'Artcollections');
    browser.waitForAngular();
    savedRecordsPage = new SavedRecordsPage();

    savedRecordsPage.clickRecentSearches();
    var searches = savedRecordsPage.getAllSearches();
    expect(searches.count()).toBe(4);
    expect(savedRecordsPage.getSearchTerm(0).getText()).toEqual('art');
  });


  it('should run search when clicking on search term', function () {
    resultsPage.toggleFacetOption('subject', 'Russia');
    resultsPage.toggleFacetOption('subject', 'Artcollections');
    resultsPage.toggleFacetOption('subject', 'France');

    browser.waitForAngular();
    savedRecordsPage = new SavedRecordsPage();
    savedRecordsPage.clickRecentSearches();
    browser.waitForAngular();
    savedRecordsPage.clickSearch(2);
    expect(resultsPage.facetChips.get(0).getText()).toEqual('art (Keyword)');
    expect(resultsPage.facetChips.get(1).getText()).toEqual('Russia (Subject)');
    expect(resultsPage.facetChips.get(2).getText()).toEqual('Art collections (Subject)');

    resultsPage.getHits().then(function(hits) {
      expect(hits.length).toEqual(24);
      });
    });

  it('should run a clean search when clicking search term (no filters from previous searches)', function() {
    //saves a search with no search term
    resultsPage.toggleFacetOption('subject', 'Art');
    resultsPage.toggleFacetOption('subject', 'France');
    resultsPage.submitNewSearchTerm('painting');
    browser.waitForAngular();
    savedRecordsPage = new SavedRecordsPage();
    savedRecordsPage.clickRecentSearches();
    //click on the search with no search term and no facets
    savedRecordsPage.clickSearchByText('No search term');
    browser.waitForAngular();
    expect(resultsPage.getQueryTerms().count()).toBe(0);
    expect(resultsPage.facetChips.count()).toBe(0);
  });

  it('should remove searches when clicking the remove button', function () {
    resultsPage.submitNewSearchTerm('painting');
    browser.waitForAngular();
    resultsPage.submitNewSearchTerm('history');
    resultsPage.submitNewSearchTerm('England');
    resultsPage.getQueryTerms().get(0).click();
    resultsPage.getQueryTerms().get(0).click();
    resultsPage.getQueryTerms().get(0).click();
    savedRecordsPage = new SavedRecordsPage();
    savedRecordsPage.clickRecentSearches();
    browser.waitForAngular();
    expect(savedRecordsPage.getAllSearches().count()).toBe(7);
    savedRecordsPage.removeSearch(0);
    expect(savedRecordsPage.getAllSearches().count()).toBe(6);
    savedRecordsPage.removeSearch(1);
    savedRecordsPage.removeSearch(1);
    savedRecordsPage.removeSearch(1);
    savedRecordsPage.removeSearch(1);
    savedRecordsPage.removeSearch(1);
    savedRecordsPage.removeSearch(0);
    expect(savedRecordsPage.getAllSearches().count()).toBe(0);
  });

});
