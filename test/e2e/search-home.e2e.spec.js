'use strict';

var HomePage = require('../page_objects/home.page.js');
var ResultsPage = require('../page_objects/results.page.js');

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
		homePage.seeAll();
		var resultsPage = new ResultsPage();
		resultsPage.addFacetOption('subject', 'France');
		resultsPage.addFacetOption('creator', 'Plon-Nourrit');
		expect(resultsPage.numTotalHits).toEqual(6);
		var homeButton = element(by.linkText('Portal Home'));
		homeButton.click();
		var totalTitles = element(by.binding('totalTitles'));
		expect(totalTitles.getText()).toEqual('452');
	});

});