/* globals by */
'use strict';

var HomePage = require('../page_objects/home.page.js');

describe('Home Page', function() {
	var homePage;

	beforeEach(function(){
		homePage = new HomePage();
	});

	it('Should display the correct number of Titles', function() {
		var totalTitles = element(by.binding('totalTitles'));
		expect(totalTitles.getText()).toEqual('452');
	});

	it('Should display the correct number of Titles after a search', function() {
		homePage.submitHomePageQuery('art');
		homePage.addFacetOption('subject', 'Russia');
		homePage.addFacetOption('Language', 'French');
		expect(homePage.numTotalHits).toEqual(1);
		var homeButton = element(by.linkText('Portal Home'));
		homeButton.click();
		var totalTitles = element(by.binding('totalTitles'));
		expect(totalTitles.getText()).toEqual('452');
	});

  it('Should display all records when user clicks See All button', function() {
		homePage.seeAll();
    homePage.getHits().then(function(hits) {
      expect(hits.length).toEqual(25);
      expect(homePage.showingResultsDialogue).toEqual('Showing 1 - 25 of 452 results');
    });
  });

  it('Should display all records sorted by most recent when use clicks See New Records link', function() {
		homePage.seeNewRecords();
    homePage.getHits().then(function(hits) {
      expect(hits.length).toEqual(25);
      expect(homePage.showingResultsDialogue).toEqual('Showing 1 - 25 of 452 results');

      // should reflect sort by date added
      expect(homePage.getSortButtonText()).toEqual('Sort by: Newly Added First');
      homePage.getQueryString().then(function(queryString){
        expect(queryString).toEqual('from=0&size=25&sort=date_added');
      });
    });
  });

});

