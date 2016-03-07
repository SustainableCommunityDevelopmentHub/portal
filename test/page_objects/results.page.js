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
  }},
  openFacetModal: { value: function(facet) {
    this.openFacetTab(facet);
    element(by.id("see-all-"+facet)).click();
  }},
  getModalFacetOption: { value: function(facetOption) {
    return element(by.id(facetOption));
  }},
  getModalFacetOptionValue: { value: function(facetOption) {
    return this.getModalFacetOption(facetOption).getAttribute('value');
  }},
  applyModalFacetOption: { value: function(facetOption) {
    this.getModalFacetOption(facetOption).click();
    return element(by.css(".apply-btn")).click();
  }},
  activeFacets: { get: function() {
    return element.all(by.repeater('activeFacet in activeFacets'));
  }},
  getActiveFacet: { get: function(position) {
    return this.getActiveFacets().get(position);
  }},
  getActiveFacetText: { value: function(position) {
    return this.activeFacets.get(position).getText();
  }},
  getModalFacetTab: { value: function(position) {
    return element.all(by.css(".facet-tabs li")).get(position);
  }},
  clickModalFacetTab: { value: function(position) {
    return this.getModalFacetTab(position).click();
  }},
  activeModalTab: { get: function() {
    return element(by.css('.active-facet-tab'));
  }},
  modalOptions: { get: function() {
    return element.all(by.css(".filter-checkboxes label"));
  }},
  selectModalOption: { value: function(position) {
    return this.modalOptions.get(position).click();
  }},
  selectModalOptions: { value: function(positions) {
    for (var position in positions) {
      this.modalOptions.get(position).click(); 
    }
  }},
  toggleModalSeeOnly: { value: function() {
    return element(by.css(".checked-filters a")).click();
  }},
  addModalSearchTerm: { value: function(term) {
    element(by.css('.search-filters')).sendKeys(term);
  }},
  closeModal: { value: function() {
    element(by.css(".close-modal")).click();
  }}
});


module.exports = ResultsPage;
