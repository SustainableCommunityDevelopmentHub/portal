//contributors.e2e.spec.js

describe('Contributors Page', function() {

	var seeAllContribsLink = element(by.uiSref('contributors'));

	beforeEach(function() {
		browser.get('');
		seeAllContribsLink.click().then(function() {
			browser.waitForAngular();
		});
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
			$('.showing').evaluate('numTotalHits').then(function(value) {
				numContribResults = value;
				expect(numContribResults).toEqual(44);
			});
			element.all(by.repeater('activeFacet in activeFacets')).then(function(chips) {
				expect(chips.length).toEqual(1);
				var contribFacet = chips[0];
				expect(contribFacet.getText()).toEqual('Metropolitan Museum of Art');
			});
		});
	});
		

});