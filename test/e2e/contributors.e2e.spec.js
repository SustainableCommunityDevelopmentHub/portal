//contributors.e2e.spec.js
/* global by */

var ContributorsPage = require('../page_objects/contributors.page.js');

describe('Contributors Page', function() {

	var contributorsPage;

	beforeEach(function() {
		contributorsPage = new ContributorsPage();
	});

	it('Should change to contributors state', function() {
		expect(browser.getCurrentUrl()).toBe('http://local.portal.dev:8000/contributors');
	});

	it('Should return correct number of records per contributor', function() {
		element.all(by.repeater('contributor in institutions')).then(function(contributors) {
			expect(contributors.length).toEqual(6);
			var contribName = contributors[0].$('.name-contrib');
			var contribNum = contributors[3].$('.num-contrib');
			expect(contribName.getText()).toEqual('Gallica - Bibliothèque nationale de France');
			expect(contribNum.getText()).toEqual('84 Records');
		});
	});

	it('Should return all records belonging to a contributor', function() {
		element.all(by.repeater('contributor in institutions')).then(function(contributors) {
			var contribSearchLink = contributors[4].$('.num-contrib');
			contribSearchLink.click().then(function() {
				browser.waitForAngular();
			});
			expect(browser.getCurrentUrl()).toContain('/search?');
			var numContribResults;
			var contribResultsCount = element.all(by.css('.showing')).first();
			contribResultsCount.evaluate('numTotalHits').then(function(value) {
				numContribResults = value;
				expect(numContribResults).toEqual(44);
			});
			element.all(by.repeater('activeFacet in activeFacets')).then(function(chips) {
				expect(chips.length).toEqual(1);
				var contribFacet = chips[0];
				expect(contribFacet.getText()).toEqual('Metropolitan Museum of Art (From)');
			});
		});
	});

	it('should send user to contributor homepage on click of contributor name', function() {
    	contributorsPage.getContributor(0).click();
    	browser.getAllWindowHandles().then(function (handles) {
      		var newWindowHandle = handles[1]; // this is your new window
      		browser.switchTo().window(newWindowHandle).then(function () {
        	browser.ignoreSynchronization = true;
        	expect(browser.getCurrentUrl()).toContain('http://gallica.bnf.fr/');
        	browser.ignoreSynchronization = false;
      });
    });
  	});
		

});
