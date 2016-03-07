'use strict';


var ResultsPage = function() {
  browser.get('/search');
};


ResultsPage.prototype = Object.create({}, {
  tabPositions: { get: function() {
    return {'type': 0, 'subject': 1, 'creator': 2, 'language': 3, 'grp_contributor': 4};
  }},
  searchButton: { get: function() { 
    return element(by.id('go-btn-results')); 
  }},
  numTotalHits: { get: function() { 
    return $('.dropdown.results-top', '.showing').evaluate('numTotalHits');
  }},
  getHits: { value: function() {
    return $('.book-listing').evaluate('hits');
  }},
  getSidebarTab: { value: function(position) {
    return element.all(by.css(".left_sidebar_accordion__tab")).get(position);
  }},
  submitNewSearchTerm: { value: function(term) {
    element(by.model('newQueryTerm')).sendKeys(term);
    this.searchButton.click();
  }},
  openFacetTab: { value: function(facet) {
    var position = this.tabPositions[facet];
    return this.getSidebarTab(position).click();
  }},
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
  getActiveFacet: { value: function(position) {
    return this.activeFacets.get(position);
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
  }},
  facetChips: { get: function() {
    return element.all(by.css(".facet-chip a"));
  }},
  advancedFacetChips: { get: function() {
    return element.all(by.repeater("advancedField in advancedFields"));
  }},
  sortOptions: { get: function() {
    return element.all(by.repeater('sortMode in validSortModes'));
  }}
});


module.exports = ResultsPage;
