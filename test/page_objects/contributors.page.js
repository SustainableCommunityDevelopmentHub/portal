'use strict';

var ContributorsPage = function() {
  browser.get('/contributors');
};

ContributorsPage.prototype = Object.create({}, {
  allContributors: { get: function() {
    return element.all(by.css('.name-contrib'));
  }},
  getContributor: { value: function(position) {
    return this.allContributors.get(position);
  }}
});

module.exports = ContributorsPage;