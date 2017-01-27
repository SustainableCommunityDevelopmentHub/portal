/* globals by */
'use strict';

var HomePage = require('../page_objects/home.page.js');
var ResultsPage = require('../page_objects/results.page.js');

describe('Home Page', function() {
	var homePage;

	beforeEach(function(){
		homePage = new HomePage();
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

  it('Should split keywords unless quoted', function() {
    homePage.submitHomePageQuery('french \"art history\" skin-nay! \"of the\"');
    homePage.getHits().then(function(hits) {
      expect(hits.length).toEqual(20);
      expect(homePage.facetChips.get(1).getText()).toEqual("skin-nay! (Keyword)");
      expect(homePage.facetChips.get(2).getText()).toEqual("art history (Keyword)");
    });
  });

  it('Should clear query terms upon return to home page', function() {
    homePage.submitHomePageQuery('new york');
    homePage.getHits().then(function(hits) {
      expect(hits.length).toEqual(5);
      expect(homePage.facetChips.get(0).getText()).toEqual("new (Keyword)");
      expect(homePage.facetChips.get(1).getText()).toEqual("york (Keyword)");
    });
    homePage.clickHome();
    homePage.submitHomePageQuery('\"new york\"');
    homePage.getHits().then(function(hits) {
      expect(hits.length).toEqual(5);
      expect(homePage.facetChips.get(0).getText()).toEqual("new york (Keyword)");
    });
  });

  it('Should have functioning contact us link in footer', function() {
    homePage.contactUs();
    browser.ignoreSynchronization = true;
    expect(browser.getCurrentUrl()).toContain('http://www.getty.edu/about/contact_us.html');
    browser.ignoreSynchronization = false;
  });

  it('Should have functioning privacy policy link in footer', function() {
    homePage.privacyPolicy();
    browser.ignoreSynchronization = true;
    expect(browser.getCurrentUrl()).toContain('http://www.getty.edu/legal/privacy.html');
    browser.ignoreSynchronization = false;
  });

	it('Should have functioning terms of use link in footer', function() {
		homePage.termsOfUse();
		browser.ignoreSynchronization = true;
  		expect(browser.getCurrentUrl()).toContain('http://www.getty.edu/legal/copyright.html');
  		browser.ignoreSynchronization = false;
  	});
});

