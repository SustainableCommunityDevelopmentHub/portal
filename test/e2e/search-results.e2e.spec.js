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
    expect(resultsPage.numTotalHits).toEqual(28);
  });
  it('should split keywords unless quoted', function() {
    resultsPage.submitNewSearchTerm('french \"art history\" skin-nay! \"of the\"');
    expect(resultsPage.numTotalHits).toEqual(20);
    expect(resultsPage.facetChips.get(1).getText()).toEqual("skin-nay! (Keyword)");
    expect(resultsPage.facetChips.get(2).getText()).toEqual("art history (Keyword)");
  });

  it('should show decoded urls in search bar', function() {
    resultsPage.submitNewSearchTerm("http://www.getty.edu/research/");
    expect(resultsPage.facetChips.get(0).getText()).toEqual("http://www.getty.edu/research/ (Keyword)");
  });

  it('should send user to digital item upon clicking of View Digital Item button', function() {
    resultsPage.submitNewSearchTerm('gri_9921790980001551');
    resultsPage.viewDigitalItem();
    browser.getAllWindowHandles().then(function (handles) {
      var newWindowHandle = handles[3]; // this is your new window
      browser.switchTo().window(newWindowHandle).then(function () {
        browser.ignoreSynchronization = true;
        expect(browser.getCurrentUrl()).toContain('https://archive.org/details/handbookofarmsar00metr_0');
        browser.ignoreSynchronization = false;
      });
    });
  });

  it('should show user correct information for brief display', function() {
    resultsPage.submitNewSearchTerm('gri_9921790980001551');
    resultsPage.getHitsTitles().then(function(titles){
        expect(titles[0]).toEqual("Handbook of arms and armor, European and Oriental, including the William H. Riggs collection, by Bashford Dean.");
    });
    resultsPage.getHitsCreators().then(function(creators){
        expect(creators[0]).toEqual([ 'Metropolitan Museum of Art (New York, N.Y.)' ]);
    });
    resultsPage.getHitsGRPContributors().then(function(contributors){
        expect(contributors[0]).toEqual("Getty Research Institute");
    });
    resultsPage.getHitsPublishers().then(function(publishers){
        expect(publishers[0]).toEqual("[The Gilliss Press]");
    });
  });

  it('should not display active facets in sidebar', function(){
    resultsPage.submitNewSearchTerm('paintings');
    resultsPage.addFacetOption('subject', 'Catalogs');
    expect(resultsPage.numTotalHits).toEqual(3);

    resultsPage.getQueryString().then(function(queryString){
      expect(queryString).toEqual('q=paintings&from=0&size=25&sort=relevance&subject=Catalogs');
    });
    var option = resultsPage.getFacetOptionText('subject', 1);
    expect(option).toEqual('Art collections (4)');
  });

  it('should redisplay facets in sidebar when you remove them from search bar', function(){
    resultsPage.submitNewSearchTerm('paintings');
    expect(resultsPage.numTotalHits).toEqual(28);
    browser.wait(function () {
      return (resultsPage.getFacetOptionByLabel('subject', 'Catalogs')).isDisplayed();
    }, 3000);
    resultsPage.toggleFacetOption('subject', 'Catalogs');
    expect(resultsPage.numTotalHits).toEqual(3);
    resultsPage.getQueryString().then(function(queryString){
      expect(queryString).toEqual('q=paintings&from=0&size=25&sort=relevance&subject=Catalogs');
    });

    var catalogsChip = resultsPage.getFacetChip(1);
    catalogsChip.click();
    browser.wait(function () {
      return (resultsPage.getFacetOptionByLabel('subject', 'Catalogs')).isDisplayed();
    }, 3000); 
    var option = resultsPage.getFacetOptionText('subject', 1);
    expect(option).toEqual('Art collections (4)');
  });

  it('should filter results by date when you use date range filter', function(){
    resultsPage.submitNewSearchTerm('paintings');
    resultsPage.submitDateRange('1905', '1910');
    expect(resultsPage.numTotalHits).toEqual(9);
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
    expect(resultsPage.numTotalHits).toEqual(26);
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

  it('should filter results by date when you use date range slider', function(){
    resultsPage.submitSliderRange(150, 200);
    expect(resultsPage.numTotalHits).toEqual(10);
  })

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

  it('should display a separate chip for each keyword search', function() {
    resultsPage.submitNewSearchTerm('art');
    resultsPage.submitNewSearchTerm('painting');
    resultsPage.submitNewSearchTerm('art history')
    expect(resultsPage.getQueryTerms().count()).toBe(3);
  });

  it('should not allow for duplicate query terms', function(){
    resultsPage.submitNewSearchTerm('art');
    resultsPage.submitNewSearchTerm('art');
    resultsPage.submitNewSearchTerm('art');
    expect(resultsPage.getQueryTerms().count()).toBe(1);
    expect(resultsPage.getQueryTerms().get(0).getText()).toEqual('art (Keyword)');
  });

  it('should clear individual keywords separately', function() {
    resultsPage.submitNewSearchTerm('art');
    resultsPage.submitNewSearchTerm('painting');
    expect(resultsPage.getQueryTerms().count()).toBe(2);
    resultsPage.getFacetChip(1).click();
    expect(resultsPage.getQueryTerms().count()).toBe(1);
  });

  it('should return results with queries containing special chars', function() {
    resultsPage.submitNewSearchTerm('[art]');
    resultsPage.numTotalHits.then(function(hits){
      expect(hits).toEqual(343);
    });
    resultsPage.getFacetChip(0).click();
    resultsPage.submitNewSearchTerm("skin-nay!");
    expect(resultsPage.getFacetChip(0).getText()).toEqual('skin-nay! (Keyword)');
    resultsPage.getHits().then(function(hits) {
      expect(hits.length).toBe(1);
    });
  });

  it('should work when facets have ampersands in them', function() {
    resultsPage.submitNewSearchTerm('Harper & Brothers');
    resultsPage.numTotalHits.then(function(hits) {
      expect(hits).toEqual(1);
    });
    resultsPage.addFacetOption('creator', 'Harper & Brothers');
    resultsPage.getQueryTerms().get(0).click();
    resultsPage.numTotalHits.then(function(hits) {
      expect(hits).toEqual(1);
    });
  });

  it('should work when facets have semicolons in them', function(){
    resultsPage.addFacetOption('language', 'Spanish; Castilian');
    resultsPage.numTotalHits.then(function(hits) {
      expect(hits).toEqual(24);
    });
  });

  it('should return results with queries containing api, such as tapissiers', function() {
    resultsPage.submitNewSearchTerm('tapissiers');
    resultsPage.numTotalHits.then(function(hits){
      expect(hits).toEqual(1);
    });
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
      expect(resultsPage.numTotalHits).toEqual(343);
      expect(resultsPage.showingResultsDialogue).toEqual('Showing 11 - 20 of 343 results');
      expect(resultsPage.getSortButtonText()).toEqual('Sort by: Title: A-Z');
      resultsPage.getHitsTitles().then(function(titles){
        expect(titles).toEqual(titles.sort());
      });
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

  describe('Advanced Search', function(){

    it('should should allow users to add advanced search options from the results page', function() {
      resultsPage.clickAdvancedSearchLink();
      resultsPage.getAdvancedSearchInput().sendKeys('handbook');
      resultsPage.clickAdvAddButton();
      resultsPage.numTotalHits.then(function(hits) {
        expect(hits).toEqual(8);
      });
      expect(resultsPage.advancedFacetChips.count()).toEqual(1);
      resultsPage.advancedFacetChips.get(0).click();
      expect(resultsPage.advancedFacetChips.count()).toEqual(0);
      resultsPage.numTotalHits.then(function(hits) {
        expect(hits).toEqual(452);
      });
    });

    it('should split terms unless quoted', function() {
      resultsPage.clickAdvancedSearchLink();
      resultsPage.getAdvancedSearchInput().sendKeys('handbook \"in kent\"');
      resultsPage.clickAdvAddButton();
      resultsPage.numTotalHits.then(function(hits) {
        expect(hits).toEqual(2);
        expect(resultsPage.facetChips.get(0).getText()).toEqual("handbook (Keyword: Title)");
        expect(resultsPage.facetChips.get(1).getText()).toEqual("in kent (Keyword: Title)");
      });
    });

    it('should keep advanced search drop down open after adding an option', function() {
      resultsPage.clickAdvancedSearchLink();
      resultsPage.getAdvancedSearchInput().sendKeys('handbook');
      resultsPage.clickAdvAddButton();
      expect(resultsPage.getAdvancedSearchInput().isDisplayed()).toBeTruthy();
      resultsPage.clickAdvancedSearchLink();
      expect(resultsPage.getAdvancedSearchInput().isDisplayed()).toEqual(false);
    });
  });

});
