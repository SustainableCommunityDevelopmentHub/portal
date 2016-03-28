'use strict';

var ResultsPage = function() {
  browser.get('/search');
};

ResultsPage.prototype = Object.create({}, {

  // Load page directly
  loadPageByURL: { value: function(q, from, size) {
    browser.get('/search?q=' + q + '&size=' + size + '&from=' + from);
  }},
  loadPage: { value: function (page) {
    //from=0 for page 1, from=25 for page 2, etc
    this.loadPageByURL('', (page - 1)*25, 25);
  }},

  // Search Bar
  searchButton: { get: function() {
    return element(by.id('go-btn-results'));
  }},
  submitNewSearchTerm: { value: function(term) {
    element(by.model('newQueryTerm')).sendKeys(term);
    this.searchButton.click();
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
  facetChips: { get: function() {
    return element.all(by.css(".facet-chip a"));
  }},
  advancedFacetChips: { get: function() {
    return element.all(by.repeater("advancedField in advancedFields"));
  }},

  // Sorting
  sortOptions: { get: function() {
    return element.all(by.repeater('sortMode in validSortModes'));
  }},
  selectSortOption: { value: function(label) {
    element(by.id('toggle-sort-btn')).click();
    element(by.linkText(label)).click();
  }},

  // Pagination
  pagingTopExists: { get: function() {
    return $('.results-pagination-top');
  }},
  pagingBottomExists: { get: function() {
    return $('.results-pagination');
  }},
  // next page
  pagingTopNextPage: { value: function(){
    // the ng-click function is inserted by the dirPaginate directive
    element(by.css('.results-pagination-top [ng-click="setCurrent(pagination.current + 1)"]')).click();
  }},
  pagingBottomNextPage: { value: function(){
    element(by.css('.results-pagination [ng-click="setCurrent(pagination.current + 1)"]')).click();
  }},
  // prev page
  pagingTopPreviousPage: { value: function(){
    element(by.css('.results-pagination-top [ng-click="setCurrent(pagination.current - 1)"]')).click();
  }},
  pagingBottomPreviousPage: { value: function(){
    element(by.css('.results-pagination [ng-click="setCurrent(pagination.current - 1)"]')).click();
  }},
  // page 3
  pagingTopGoToPageThree: { value: function(page){
    element.all(by.css('.results-pagination-top [ng-click="setCurrent(pageNumber)"]')).get(2).click();
  }},
  pagingBottomGoToPageThree: { value: function(page){
    element.all(by.css('.results-pagination [ng-click="setCurrent(pageNumber)"]')).get(2).click();
  }},
  // first page
  pagingTopFirstPage: { value: function(){
    element(by.css('.results-pagination-top [ng-click="setCurrent(1)"]')).click();
  }},
  pagingBottomFirstPage: { value: function(){
    element(by.css('.results-pagination [ng-click="setCurrent(1)"]')).click();
  }},
  // last page
  pagingTopLastPage: { value: function(){
    element(by.css('.results-pagination-top [ng-click="setCurrent(pagination.last)"]')).click();
  }},
  pagingBottomLastPage: { value: function(){
    element(by.css('.results-pagination [ng-click="setCurrent(pagination.last)"]')).click();
  }},

  // Saved Records
  toggleSavingRecord: { value: function(position) {
    element.all(by.css('.bookmark')).get(position).click();
  }},
  getBookMark: {value: function(position) {
    return element.all(by.css('.bookmark p i i')).get(position);
  }},

  // Results
  showingResultsDialogue: { get: function() {
    return element.all(by.css('.showing')).get(1).getText();
  }},
  numTotalHits: { get: function() {
    return element.all(by.css('.showing')).get(0).evaluate('numTotalHits');
  }},
  // returns promise
  getHits: { value: function() {
    return element.all(by.css('.book-listing')).get(0).evaluate('hits');
  }},
  getHitsDates: { value: function() {
    var dates = [];
    this.getHits().then(function(hits) {
      for(var i = 0; i < hits.length; i++){
        dates.push(hits[i]._date_facet);
      }
    });
    return dates;
  }},
  getHitsIngestDates: { value: function() {
    var dates = [];
    this.getHits().then(function(hits) {
      for(var i = 0; i < hits.length; i++){
        dates.push(hits[i]._ingest_date);
      }
    });
    return dates;
  }},
  getHitsTitles: { value: function() {
    var titles = [];
    this.getHits().then(function(hits) {
      for(var i = 0; i < hits.length; i++){
        titles.push(hits[i]._title_display);
      }
    });
    return titles;
  }},
  getBookMark: {value: function(position) {
    return element.all(by.css('.bookmark .inside')).get(position);
  }},
  clickBookLink: {value: function(position) {
    element.all(by.css('.book-info a')).get(position).click();
  }},

  // Facet Sidebar
  tabPositions: { get: function() {
    return {'type': 0, 'subject': 1, 'creator': 2, 'language': 3, 'grp_contributor': 4};
  }},
  getSidebarTab: { value: function(position) {
    return element.all(by.css(".panel-heading")).get(position);
  }},
  /*
  toggleFacetTab: { value: function(facet) {
    var position = this.tabPositions[facet];
    return this.getSidebarTab(position).click();
  }},
  */
  getFacetOption: { value: function(facet, position) {
    return element.all(by.repeater('facet in facets.'+facet)).get(position);
  }},
  getFacetOptionByLabel: { value: function(facet, label) {
    return element(by.id(label+"-sidebar"));
  }},
  addFacetOption: { value: function(facet, label) {
    label = label.replace(/ /g, '');
    element(by.id(label+"-sidebar")).click();
  }},
  toggleFacetOption: { value: function(facet, label) {
    this.getFacetOptionByLabel(facet, label).click();
  }},

  // Date Range
  submitDateRange: { value: function(from, to) {
    var from = typeof from !== 'undefined' ? from : '';
    var to = typeof to !== 'undefined' ? to : '';
    element(by.model('fromDate')).sendKeys(from);
    element(by.model('toDate')).sendKeys(to);
    element.all(by.id("date-btn-results")).get(0).click();
  }},

  // Facet Modal
  openFacetModal: { value: function(facet) {
    element(by.id("see-all-"+facet)).click();
  }},
  getModalFacetOption: { value: function(facetOption) {
    return element(by.id(facetOption));
  }},
  getModalFacetOptionValue: { value: function(facetOption) {
    return this.getModalFacetOption(facetOption).getAttribute('value');
  }},
  applyModalFacetOption: { value: function(facetOption) {
    element(by.id(facetOption)).click();
    return element(by.css(".apply-btn")).click();
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
