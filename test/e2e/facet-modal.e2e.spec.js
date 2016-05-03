'use strict';
/* globals protractor, by */

var ResultsPage = require('../page_objects/results.page.js');


describe("Facet Modal", function(){
  var resultsPage;

  beforeEach(function() {
    resultsPage = new ResultsPage();
    resultsPage.submitNewSearchTerm('painting');
    expect(resultsPage.numTotalHits).toEqual(25);
  });
  
  it("should open modal window with previously checked facets checked", function(){
    resultsPage.addFacetOption('subject', 'Exhibitions');
    resultsPage.openFacetModal('subject');
    expect(resultsPage.getModalFacetOptionValue('Exhibitions')).toEqual('on');
  });

  it("should deactivate previously checked facets correctly", function() {
    resultsPage.addFacetOption('subject', 'Exhibitions');
    expect(resultsPage.activeFacets.count()).toBe(1);
    resultsPage.openFacetModal('subject');
    resultsPage.applyModalFacetOption('Exhibitions');
    expect(resultsPage.activeFacets.count()).toBe(0);
  });

  it("should deactivate and activate facets correctly", function() {
    resultsPage.addFacetOption('subject', 'Exhibitions');
    resultsPage.openFacetModal('subject');
    resultsPage.getModalFacetOption('Painting').click();
    resultsPage.applyModalFacetOption('Exhibitions');
    expect(resultsPage.activeFacets.count()).toBe(1);
  })
  
  describe("tests launching modal from 'Language' category", function(){
    beforeEach(function(){
      resultsPage.openFacetModal('language');
    });

    it("should apply checked filters when you click 'Apply'", function(){
      var EC = protractor.ExpectedConditions;

      expect(resultsPage.getModalFacetOption('Russian')).toBeDefined();
      resultsPage.applyModalFacetOption('Russian');

      // chrome can run too fast so we must wait
      browser.wait(EC.visibilityOf(resultsPage.getActiveFacetText(0)), 5000);

      expect(resultsPage.getActiveFacetText(0)).toEqual("Russian (Language)");
    });

    it("should change the active category when you click on a different category tab", function(){
      resultsPage.clickModalFacetTab(1);
      expect(resultsPage.activeModalTab.getText()).toEqual('Subject');
    });

  });

  describe("tests launching modal from 'Subject' category", function(){

    beforeEach(function(){
      resultsPage.openFacetModal('subject');
    });

    it("should open with the category you clicked 'See All' from", function(){
      expect(resultsPage.activeModalTab.getText()).toEqual('Subject');
    });

    it("should add indicator to category tab when facet is checked", function(){
      var labels = element.all(by.css(".filter-labels"));
      labels.get(0).click();

      var categoryTab = element(by.css('.selected-facet-tabs'));
      expect(categoryTab).toBeDefined();
      expect(categoryTab.getText()).toEqual("Subject");
    });

    it("should display only checked facets when 'See Only Checked' is clicked", function(){
      var initialCount = resultsPage.modalOptions.count();
      resultsPage.selectModalOptions([0,3,4]);     
      resultsPage.toggleModalSeeOnly();
      expect(resultsPage.modalOptions.count()).toBe(3);

      var allChecked = true;
      resultsPage.modalOptions.each(function(checkbox){
        checkbox.getAttribute("value").then(function(val){
          if(val !== "on"){
            allChecked = false;
          }
        });
      });
      expect(allChecked).toBe(true);
      resultsPage.toggleModalSeeOnly();
      expect(resultsPage.modalOptions.count()).toEqual(initialCount);
    });

    it("should filter checkboxes after typing in search text box", function(){
      var initialCount = resultsPage.modalOptions.count();
      var containsFilteredTerm = true;

      resultsPage.addModalSearchTerm('paint');
      resultsPage.modalOptions.each(function(checkbox){
        checkbox.getText().then(function(text){
          if(text.indexOf('paint') < 0){
            containsFilteredTerm = false;
          }
        });
      });
      expect(containsFilteredTerm).toBe(true);
    });

    it("should not apply checked filters if 'X' button clicked", function(){
      resultsPage.selectModalOptions([0,1]);
      resultsPage.closeModal();
      expect(resultsPage.activeFacets.count()).toBe(0);
    });
  });
});
