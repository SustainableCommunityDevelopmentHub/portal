'use strict';

function getFacetSideBarTab(position){
  return element.all(by.css(".left_sidebar_accordion__tab")).get(position);
}

var ResultsPage = function() {
  browser.get('/search');
};

ResultsPage.prototype = Object.create({}, {
  searchButton: { get: function() { return element(by.id('go-btn-results')); }},
  numTotalHits: { get: function() { 
    return $('.dropdown.results-top', '.showing').evaluate('numTotalHits');
  }},
  typeFacetTab: { get: function() { return getFacetSideBarTab(0); }},
  subjectFacetTab: { get: function() { return getFacetSideBarTab(1); }},
  creatorFacetTab: { get: function() { return getFacetSideBarTab(2); }},
  languageFacetTab: { get: function() { return getFacetSideBarTab(3); }},
  grp_contributorFacetTab: { get: function() { return getFacetSideBarTab(4); }},
  submitNewSearchTerm: { value: function(term) {
    element(by.model('newQueryTerm')).sendKeys(term);
    this.searchButton.click();
  }},
  openFacetTab: { value: function(facet) { 
    var tab = this.__lookupGetter__(facet+"FacetTab")();
    return tab.click(); }},
  getFacetOption: { value: function(facet, position) {
    this.openFacetTab(facet);
    return element.all(by.repeater('facet in facets.'+facet)).get(position);
  }},
  addFacetOption: { value: function(facet, label) {
    this.openFacetTab(facet);
    $("[id='" + label + "-sidebar']").click();
  }}
});

module.exports = ResultsPage;
