// search-results.spec.js
'use strict';

var ResultsPage = require('../page_objects/results.page.js');
var BookDetailPage = require('../page_objects/book-detail.page.js');
var HomePage = require('../page_objects/home.page.js');

describe('Search Results', function() {
  var resultsPage;

  beforeEach(function() {
    resultsPage = new ResultsPage();
  });

  it('should have correct default settings in URL', function() {
    resultsPage.submitNewSearchTerm('');
    resultsPage.getQueryString().then(function(queryString){
      expect(queryString).toEqual('from=0&size=25&sort=relevance');
    });
  });
  it('Should have correct text in sort button', function() {
    resultsPage.submitNewSearchTerm('');
    expect(resultsPage.getSortButtonText()).toEqual('Sort by: Relevance');
  });
  it('should return correct search results', function() {
    resultsPage.submitNewSearchTerm('paintings');
    expect(resultsPage.numTotalHits).toEqual(7);
  });

  it('should show decoded urls in search bar', function() {
    resultsPage.submitNewSearchTerm("http://www.getty.edu/research/");
    expect(resultsPage.facetChips.get(0).getText()).toEqual("http://www.getty.edu/research/ (Keyword)");
  });

  it('should send user to digital item upon clicking of View Digital Item button', function() {
    resultsPage.submitNewSearchTerm('Handbook of arms and armor');
    resultsPage.viewDigitalItem();
    browser.ignoreSynchronization = true;
    expect(browser.getCurrentUrl()).toContain('https://archive.org/details/handbookofarmsar00metr_0');
    browser.ignoreSynchronization = false;
  });

  it('should not display active facets in sidebar', function(){
    resultsPage.submitNewSearchTerm('paintings');
    resultsPage.addFacetOption('subject', 'Catalogs');
    expect(resultsPage.numTotalHits).toEqual(2);

    resultsPage.getQueryString().then(function(queryString){
      expect(queryString).toEqual('q=paintings&from=0&size=25&sort=relevance&subject=Catalogs');
    });
    var option = resultsPage.getFacetOptionText('subject', 1);
    expect(option).toEqual('20th century (1)');
  });

  it('should redisplay facets in sidebar when you remove them from search bar', function(){
    resultsPage.submitNewSearchTerm('paintings');
    expect(resultsPage.numTotalHits).toEqual(7);
    browser.wait(function () {
      return (resultsPage.getFacetOptionByLabel('subject', 'Catalogs')).isDisplayed();
    }, 3000);
    resultsPage.toggleFacetOption('subject', 'Catalogs');
    expect(resultsPage.numTotalHits).toEqual(2);
    resultsPage.getQueryString().then(function(queryString){
      expect(queryString).toEqual('q=paintings&from=0&size=25&sort=relevance&subject=Catalogs');
    });

    var catalogsChip = resultsPage.getFacetChip(1);
    catalogsChip.click();
    browser.wait(function () {
      return (resultsPage.getFacetOptionByLabel('subject', 'Catalogs')).isDisplayed();
    }, 3000); 
    var option = resultsPage.getFacetOptionText('subject', 1);
    expect(option).toEqual('Catalogs (2)');
  });

  it('should filter results by date when you use date range filter', function(){
    resultsPage.submitNewSearchTerm('paintings');
    resultsPage.submitDateRange('1905', '1910');
    expect(resultsPage.numTotalHits).toEqual(4);
    resultsPage.getQueryString().then(function(queryString){
      expect(queryString).toEqual('q=paintings&from=0&size=25&sort=relevance&date_gte=1905&date_lte=1910');
    });

    resultsPage.getHits().then(function(hits) {
       for(var i = 0; i < hits.length; i++){
         var date = hits[i]._date_facet;
         expect(parseInt(date)).toBeGreaterThan(1904);
         expect(parseInt(date)).toBeLessThan(1911);
       }
     });
  });

  it('should filter results by date when you use date range filter with a single parameter', function(){
    resultsPage.submitNewSearchTerm('paintings');
    resultsPage.submitDateRange('1800', '');
    expect(resultsPage.numTotalHits).toEqual(7);
    resultsPage.getQueryString().then(function(queryString){
      expect(queryString).toEqual('q=paintings&from=0&size=25&sort=relevance&date_gte=1800');
    });

    resultsPage.getHits().then(function(hits) {
       for(var i = 0; i < hits.length; i++){
         var date = hits[i]._date_facet;
         expect(parseInt(date)).toBeGreaterThan(1799);
       }
     });
  });

  it('should save book records', function () {
    resultsPage.submitNewSearchTerm('paintings');
    resultsPage.toggleSavingRecord(2);
    resultsPage.submitNewSearchTerm('');
    resultsPage.submitNewSearchTerm('paintings');
    var bookmark = resultsPage.getBookMark(2);
    expect(bookmark.getAttribute('class')).toMatch('saved');
  });

  it('should remove book records', function() {
    resultsPage.submitNewSearchTerm('paintings');
    resultsPage.toggleSavingRecord(2);
    var bookmark = resultsPage.getBookMark(2);
    var bookmarkRemoved = bookmark.getAttribute('class').then(function(classes){
      var classNames = classes.split(' ');
      return (classNames.indexOf('saved') === -1);
    });
    expect(bookmarkRemoved).toBe(true);
  });

  it('should update bookmarks for records saved in other tabs', function() {
    resultsPage.submitNewSearchTerm('paintings');
    resultsPage.toggleSavingRecord(0);
    resultsPage.getBookMark(0).getAttribute('class').then(function(classes){
      var classNames = classes.split(' ');
      var saved = classNames.indexOf('saved');
      expect(saved).toBeGreaterThan(-1);
    });
    resultsPage.clickBookLink(0);

    browser.getAllWindowHandles().then(function (handles) {
      var newWindowHandle = handles[1]; // this is your new window

      browser.switchTo().window(newWindowHandle).then(function () {
        var bookDetailPage = new BookDetailPage();
        bookDetailPage.clickBookmark(0);
      });
    });
    browser.getAllWindowHandles().then(function(handles) {
      var newWindowHandle = handles[0];

      browser.switchTo().window(newWindowHandle).then(function () {
        expect(browser.driver.getCurrentUrl()).toContain("search");
        var bookmark = resultsPage.getBookMark(0);
        bookmark.getAttribute('class').then(function(classes){
          var classNames = classes.split(' ');
          var bookmarkRemoved = classNames.indexOf('saved') === -1;
          expect(bookmarkRemoved).toBe(true);
        });
      });
    });
  });

  it('should have the search bar focused after each action', function(){
    browser.waitForAngular();
    expect(resultsPage.searchResultsInput.getAttribute("id")).toEqual(resultsPage.getFocusedElement.getAttribute("id"));

    resultsPage.submitNewSearchTerm("art");
    browser.waitForAngular();
    expect(resultsPage.searchResultsInput.getAttribute("id")).toEqual(resultsPage.getFocusedElement.getAttribute("id"));

    resultsPage.pagingTopNextPage();
    browser.waitForAngular();
    expect(resultsPage.searchResultsInput.getAttribute("id")).toEqual(resultsPage.getFocusedElement.getAttribute("id"));
  });

  it('should focus on search bar when going back to home page', function() {
    resultsPage.submitNewSearchTerm("art");
    var homePage = new HomePage();
    browser.waitForAngular();
    expect(homePage.searchBar.getAttribute("class")).toEqual(resultsPage.getFocusedElement.getAttribute("class"));
  });

  it('should gray out facet chips with zero limiting results', function() {
    resultsPage.toggleFacetOption('language', 'French');
    resultsPage.toggleFacetOption('language', 'German');
    resultsPage.toggleFacetOption('from', 'Gallica-BibliothèquenationaledeFrance');

    var facets = resultsPage.getFacetChipsNoResults();
    expect(facets.count()).toBe(1);
    expect(facets.get(0).getText()).toEqual("German (Language)");
  });


  describe('Pagination', function(){
    var query = '';

    var showingResultsPageOne = 'Showing 1 - 25 of 452 results';
    var showingResultsPageTwo = 'Showing 26 - 50 of 452 results';
    var showingResultsPageThree = 'Showing 51 - 75 of 452 results';
    var showingResultsLastPage = 'Showing 451 - 452 of 452 results';

    // page just navigated to should always be secondPageHits
    function checkPageDifference(firstPageHits, secondPageHits){
      for(var i = 0; i < secondPageHits.length; i++){
        expect(secondPageHits[i]).not.toEqual(firstPageHits[i]);
      }
    }

    beforeEach(function(){
      resultsPage = new ResultsPage();
    });

    // pagination bar
    it('should display pagination bar at top of page', function () {
      resultsPage.loadPage(1);
      expect(resultsPage.pagingTopExists).toBeTruthy();
    });
    it('should display pagination bar at bottom of page', function () {
      resultsPage.loadPage(1);
      expect(resultsPage.pagingBottomExists).toBeTruthy();
    });
    // next page button
    it("should navigate to next page clicking on 'next' button, \'showing dialogue\' - pagination top", function(){
      var pageOneHits;
      resultsPage.loadPage(1);
      expect(resultsPage.showingResultsDialogue).toEqual(showingResultsPageOne);

      resultsPage.getHits().then(function(hits){
        pageOneHits = hits;
        expect(pageOneHits.length).toEqual(25);
      });

      resultsPage.pagingTopNextPage();

      expect(resultsPage.showingResultsDialogue).toEqual(showingResultsPageTwo);
      resultsPage.getQueryString().then(function(queryString){
        expect(queryString).toEqual('from=25&size=25&sort=relevance');
      });

      resultsPage.getHits().then(function(pageTwoHits){
        expect(pageTwoHits.length).toEqual(25);
        checkPageDifference(pageOneHits, pageTwoHits);
      });
    });
    it("should display \'sort\' pagination value in URL query params", function(){
      var pageOneHits;
      resultsPage.loadPage(1);
      resultsPage.pagingTopNextPage();

      expect(resultsPage.showingResultsDialogue).toEqual(showingResultsPageTwo);
      resultsPage.getQueryString().then(function(queryString){
        expect(queryString).toEqual('from=25&size=25&sort=relevance');
      });
    });
    it("should navigate to next page clicking on 'next' button, \'showing dialogue\' - pagination bottom ", function(){
      var pageOneHits;
      resultsPage.loadPage(1);
      expect(resultsPage.showingResultsDialogue).toEqual(showingResultsPageOne);

      resultsPage.getHits().then(function(hits){
        pageOneHits = hits;
        expect(pageOneHits.length).toEqual(25);
      });

      resultsPage.pagingBottomNextPage();
      expect(resultsPage.showingResultsDialogue).toEqual(showingResultsPageTwo);

      resultsPage.getHits().then(function(pageTwoHits){
        expect(pageTwoHits.length).toEqual(25);
        checkPageDifference(pageOneHits, pageTwoHits);
      });
    });
    // previous page button
    it("should navigate to previous page clicking on 'previous' button, \'showing dialogue\' - pagination top", function(){
      var pageTwoHits;
      resultsPage.loadPage(2);
      expect(resultsPage.showingResultsDialogue).toEqual(showingResultsPageTwo);

      resultsPage.getHits().then(function(hits){
        pageTwoHits = hits;
        expect(pageTwoHits.length).toEqual(25);
      });

      resultsPage.pagingTopPreviousPage();
      expect(resultsPage.showingResultsDialogue).toEqual(showingResultsPageOne);

      resultsPage.getHits().then(function(pageOneHits){
        expect(pageOneHits.length).toEqual(25);
        checkPageDifference(pageTwoHits, pageOneHits);
      });
    });
    it("should navigate to previous page clicking on 'previous' button, \'showing dialogue\' - pagination bottom ", function(){
      var pageTwoHits;
      resultsPage.loadPage(2);
      expect(resultsPage.showingResultsDialogue).toEqual(showingResultsPageTwo);

      resultsPage.getHits().then(function(hits){
        pageTwoHits = hits;
        expect(pageTwoHits.length).toEqual(25);
      });

      resultsPage.pagingBottomPreviousPage();
      expect(resultsPage.showingResultsDialogue).toEqual(showingResultsPageOne);

      resultsPage.getHits().then(function(pageOneHits){
        expect(pageOneHits.length).toEqual(25);
        checkPageDifference(pageTwoHits, pageOneHits);
      });
    });
    // first page button
    it("should navigate to first page by clicking on \'first page\' button - pagination top", function(){
      var pageThreeHits;
      resultsPage.loadPage(3);
      expect(resultsPage.showingResultsDialogue).toEqual(showingResultsPageThree);

      resultsPage.getHits().then(function(hits){
        pageThreeHits = hits;
        expect(pageThreeHits.length).toEqual(25);
      });

      resultsPage.pagingTopFirstPage();
      expect(resultsPage.showingResultsDialogue).toEqual(showingResultsPageOne);

      resultsPage.getHits().then(function(pageOneHits){
        expect(pageOneHits.length).toEqual(25);
        checkPageDifference(pageThreeHits, pageOneHits);
      });
    });
    it("should navigate to first page by clicking on \'first page\' button - pagination bottom", function(){
      var pageThreeHits;
      resultsPage.loadPage(3);
      expect(resultsPage.showingResultsDialogue).toEqual(showingResultsPageThree);

      resultsPage.getHits().then(function(hits){
        pageThreeHits = hits;
        expect(pageThreeHits.length).toEqual(25);
      });

      resultsPage.pagingBottomFirstPage();
      expect(resultsPage.showingResultsDialogue).toEqual(showingResultsPageOne);

      resultsPage.getHits().then(function(pageOneHits){
        expect(pageOneHits.length).toEqual(25);
        checkPageDifference(pageThreeHits, pageOneHits);
      });
    });
    // last page button
    it("should navigate to last page by clicking on \'last page\' button - pagination top", function(){
      var pageOneHits;
      resultsPage.loadPage(1);
      expect(resultsPage.showingResultsDialogue).toEqual(showingResultsPageOne);

      resultsPage.getHits().then(function(hits){
        pageOneHits = hits;
        expect(pageOneHits.length).toEqual(25);
      });

      resultsPage.pagingTopLastPage();
      expect(resultsPage.showingResultsDialogue).toEqual(showingResultsLastPage);

      resultsPage.getHits().then(function(lastPageHits){
        expect(lastPageHits.length).toEqual(2);
        checkPageDifference(pageOneHits, lastPageHits);
      });
    });
    it("should navigate to last page by clicking on \'last page\' button - pagination bottom", function(){
      var pageOneHits;
      resultsPage.loadPage(1);
      expect(resultsPage.showingResultsDialogue).toEqual(showingResultsPageOne);

      resultsPage.getHits().then(function(hits){
        pageOneHits = hits;
        expect(pageOneHits.length).toEqual(25);
      });

      resultsPage.pagingBottomLastPage();
      expect(resultsPage.showingResultsDialogue).toEqual(showingResultsLastPage);

      resultsPage.getHits().then(function(lastPageHits){
        expect(lastPageHits.length).toEqual(2);
        checkPageDifference(pageOneHits, lastPageHits);
      });
    });
    // a particular page button
    it("should navigate to page by clicking on page number button in pagination bar - pagination top", function(){
      var pageOneHits;
      resultsPage.loadPage(1);
      expect(resultsPage.showingResultsDialogue).toEqual(showingResultsPageOne);

      resultsPage.getHits().then(function(hits){
        pageOneHits = hits;
        expect(pageOneHits.length).toEqual(25);
      });

      resultsPage.pagingTopGoToPageThree();
      expect(resultsPage.showingResultsDialogue).toEqual(showingResultsPageThree);

      resultsPage.getHits().then(function(pageThreeHits){
        expect(pageThreeHits.length).toEqual(25);
        checkPageDifference(pageOneHits, pageThreeHits);
      });
    });
    it("should navigate to page by clicking on page number button in pagination bar - pagination bottom", function(){
      var pageOneHits;
      resultsPage.loadPage(1);
      expect(resultsPage.showingResultsDialogue).toEqual(showingResultsPageOne);

      resultsPage.getHits().then(function(hits){
        pageOneHits = hits;
        expect(pageOneHits.length).toEqual(25);
      });

      resultsPage.pagingBottomGoToPageThree();
      expect(resultsPage.showingResultsDialogue).toEqual(showingResultsPageThree);

      resultsPage.getHits().then(function(pageThreeHits){
        expect(pageThreeHits.length).toEqual(25);
        checkPageDifference(pageOneHits, pageThreeHits);
      });
    });
  });

  it('should clear out all facets completely', function() {
    resultsPage.submitNewSearchTerm('paintings');
    browser.wait(function () {
      return (resultsPage.getFacetOptionByLabel('subject', 'Catalogs')).isDisplayed();
    }, 3000);
    resultsPage.toggleFacetOption('subject', 'Catalogs');
    resultsPage.getQueryString().then(function(queryString){
      expect(queryString).toEqual('q=paintings&from=0&size=25&sort=relevance&subject=Catalogs');
    });

    var home = new HomePage();
    home.submitHomePageQuery('paintings');

    resultsPage.getQueryString().then(function(queryString){
      expect(queryString).toEqual('q=paintings&from=0&size=25&sort=relevance');
    });

    var activeFacets = resultsPage.activeFacets;
    expect(activeFacets.count()).toBe(0);
    var activeAdvancedFields = resultsPage.advancedFacetChips;
    expect(activeAdvancedFields.count()).toBe(0);
  });

  describe('Routing, copying and pasting URL with query params into browser', function(){
    it('should apply query term, size, from, and sort when in URL', function(){
      browser.get('/search?q=art&from=10&size=10&sort=title_asc');
      expect(resultsPage.numTotalHits).toEqual(310);
      expect(resultsPage.showingResultsDialogue).toEqual('Showing 11 - 20 of 310 results');
      expect(resultsPage.getSortButtonText()).toEqual('Sort by: Title: A-Z');
    });

    it('should apply facets when in URL', function(){
      browser.get('/search?from=0&size=25&sort=relevance&subject=Catalogs&language=French');
      expect(resultsPage.numTotalHits).toEqual(4);
    });

    it('should apply date range when in URL', function(){
      browser.get('/search?from=0&size=25&date_gte=1800&date_lte=1900&sort=relevance');
      expect(resultsPage.numTotalHits).toEqual(280);
    });
  });

});
