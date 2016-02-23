//search-sort.spec.js

describe('Sorting tests', function() {
  var searchBtn = element(by.id('go-btn'));
  var testQuery = "painting";

  beforeEach(function() {
    browser.get('');
    element(by.model('queryTerm')).sendKeys(testQuery);
    searchBtn.click();
  });


  it('Should have 6 sorting options in dropdown list', function() {
    numSortOptions = element.all(by.repeater('sortMode in validSortModes')).count();
    expect(numSortOptions).toEqual(6);
  })

  it('Should sort by publication date', function() {
    element(by.id('toggle-sort-btn')).click();
    element(by.linkText('Date (ascending)')).click();

    $('.book-listing').evaluate('hits').then(function(hits) {
       var dates = [];
       for(var i = 0; i < hits.length; i++){
         var book = hits[i];
         var date = book._date_facet;
         if(date){
           dates.push(date);
         }
       }
       var copiedDates = dates.slice(0);
       expect(dates).toEqual(copiedDates.sort());
     });
  })

  it('Should sort by publication date descending', function() {
    element(by.id('toggle-sort-btn')).click();
    element(by.linkText('Date (descending)')).click();

    $('.book-listing').evaluate('hits').then(function(hits) {
       var dates = [];
       for(var i = 0; i < hits.length; i++){
         var book = hits[i];
         var date = book._date_facet;
         if(date){
           dates.push(date);
         }
       }
       var copiedDates = dates.slice(0);
       expect(dates).toEqual(copiedDates.sort().reverse());
     });
  })

  it('Should sort by newly added first', function() {
    element(by.id('toggle-sort-btn')).click();
    element(by.linkText('Newly Added First')).click();

    $('.book-listing').evaluate('hits').then(function(hits) {
       var dates = [];
       for(var i = 0; i < hits.length; i++){
         var book = hits[i];
         var date = book._ingest_date;
         if(date){
           dates.push(date);
         }
       }
       var copiedDates = dates.slice(0);
       expect(dates).toEqual(copiedDates.sort());
     });
  })

  it('Should sort by title', function() {
    element(by.id('toggle-sort-btn')).click();
    element(by.linkText('Title: A-Z')).click();

    $('.book-listing').evaluate('hits').then(function(hits) {
       var titles = [];
       for(var i = 0; i < hits.length; i++){
         var book = hits[i];
         var title = book._title_display;
         titles.push(title);
       }
       var copiedTitles = titles.slice(0);
       expect(titles).toEqual(copiedTitles.sort());
     });
  })

  it('Should sort by title Z-A', function() {
    element(by.id('toggle-sort-btn')).click();
    element(by.linkText('Title: Z-A')).click();

    $('.book-listing').evaluate('hits').then(function(hits) {
       var titles = [];
       for(var i = 0; i < hits.length; i++){
         var book = hits[i];
         var title = book._title_display;
         titles.push(title);
       }
       var copiedTitles = titles.slice(0);
       expect(titles).toEqual(copiedTitles.sort().reverse());
     });
  })

})