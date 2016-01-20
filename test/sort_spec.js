//sort_test.js

describe('Sorting tests', function() {
  var searchBtn = element(by.id('go-btn'));


  it('Should have 6 sorting options in dropdown list', function() {
    browser.get('http://local.portal.dev:8000/search');
    element(by.model('queryTerm')).sendKeys('art');
    searchBtn.click();
    
    numSortOptions = element.all(by.repeater('sortMode in validSortModes')).count();
    expect(numSortOptions).toEqual(6);
  })

  it('Should sort by publication date', function() {
    browser.get('http://local.portal.dev:8000/search');
    element(by.model('queryTerm')).sendKeys('art');
    searchBtn.click();

    element(by.id('toggle-sort-btn')).click();
    element(by.linkText('Date (ascending)')).click();

    $('.book-listing').evaluate('hits').then(function(hits) {
       var dates = [];
       for(var i = 0; i < hits.length; i++){
         var book = hits[i];
         var date = book.date;
         for(var k = 0; k < date.length; k++){
           var d = date[k];
           if(d.qualifier == "portal_facet"){
             dates.push(d.value);
           }
         }
       }
       var copiedDates = dates.slice(0);
       expect(dates.length).toEqual(hits.length);
       expect(dates).toEqual(copiedDates.sort());
     });
  })

  it('Should sort by publication date descending', function() {
    browser.get('http://local.portal.dev:8000/search');
    element(by.model('queryTerm')).sendKeys('art');
    searchBtn.click();

    element(by.id('toggle-sort-btn')).click();
    element(by.linkText('Date (descending)')).click();

    $('.book-listing').evaluate('hits').then(function(hits) {
       var dates = [];
       for(var i = 0; i < hits.length; i++){
         var book = hits[i];
         var date = book.date;
         for(var k = 0; k < date.length; k++){
           var d = date[k];
           if(d.qualifier == "portal_facet"){
             dates.push(d.value);
           }
         }
       }
       var copiedDates = dates.slice(0);
       expect(dates.length).toEqual(hits.length);
       expect(dates).toEqual(copiedDates.sort().reverse());
     });
  })

  it('Should sort by newly added first', function() {
    browser.get('http://local.portal.dev:8000/search');
    element(by.model('queryTerm')).sendKeys('art');
    searchBtn.click();

    element(by.id('toggle-sort-btn')).click();
    element(by.linkText('Newly Added First')).click();

    $('.book-listing').evaluate('hits').then(function(hits) {
       var dates = [];
       for(var i = 0; i < hits.length; i++){
         var book = hits[i];
         var date = book.grp_ingest_date.value;
         dates.push(date);
       }
       var copiedDates = dates.slice(0);
       expect(dates.length).toEqual(hits.length);
       expect(dates).toEqual(copiedDates.sort());
     });
  })

  it('Should sort by title', function() {
    browser.get('http://local.portal.dev:8000/search');
    element(by.model('queryTerm')).sendKeys('sculpture');
    searchBtn.click();

    element(by.id('toggle-sort-btn')).click();
    element(by.linkText('Title: A-Z')).click();

    $('.book-listing').evaluate('hits').then(function(hits) {
       var titles = [];
       for(var i = 0; i < hits.length; i++){
         var book = hits[i];
         var title = book.title[0].value;
         titles.push(title);
       }
       var copiedTitles = titles.slice(0);
       expect(titles.length).toEqual(hits.length);
       expect(titles).toEqual(copiedTitles.sort());
     });
  })

  it('Should sort by title Z-A', function() {
    browser.get('http://local.portal.dev:8000/search');
    element(by.model('queryTerm')).sendKeys('sculpture');
    searchBtn.click();

    element(by.id('toggle-sort-btn')).click();
    element(by.linkText('Title: Z-A')).click();

    $('.book-listing').evaluate('hits').then(function(hits) {
       var titles = [];
       for(var i = 0; i < hits.length; i++){
         var book = hits[i];
         var title = book.title[0].value;
         titles.push(title);
       }
       var copiedTitles = titles.slice(0);
       expect(titles.length).toEqual(hits.length);
       expect(titles).toEqual(copiedTitles.sort().reverse());
     });
  })

  it('Should sort by relevance', function() {
    browser.get('http://local.portal.dev:8000/search');
    element(by.model('queryTerm')).sendKeys('sculpture');
    searchBtn.click();

    var defaultOrder = [];

    $('.book-listing').evaluate('hits').then(function(hits){
      for(var i = 0; i < hits.length; i++){
        var book = hits[i];
        defaultOrder.push(book.title[0].value);
      }
    });

    element(by.id('toggle-sort-btn')).click();
    element(by.linkText('Title: A-Z')).click();

    element(by.id('toggle-sort-btn')).click();
    element(by.linkText('Relevance')).click();

    var sortedByRelevance = [];
    $('.book-listing').evaluate('hits').then(function(hits){
      for(var i = 0; i < hits.length; i++){
        var book = hits[i];
        sortedByRelevance.push(book.title[0].value);
      }
      expect(defaultOrder).toEqual(sortedByRelevance);    
     });
  })
})