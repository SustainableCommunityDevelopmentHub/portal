'use strict';

var ResultsPage = require('../page_objects/results.page.js');


describe("Facet Modal", function(){
  var resultsPage;

  beforeEach(function() {
    resultsPage = new ResultsPage();
    resultsPage.submitNewSearchTerm('painting');
    expect(resultsPage.numTotalHits).toEqual(24);
  });
  
  it("should open modal window with previously checked facets checked", function(){
    resultsPage.addFacetOption('subject', 'Exhibitions');
    resultsPage.openFacetModal('subject');
    expect(resultsPage.getModalFacetOptionValue('Exhibitions')).toEqual('on');
  });
  
  describe("tests launching modal from 'Type' category", function(){
    beforeEach(function(){
      resultsPage.openFacetModal('type');
    });

    it("should apply checked filters when you click 'Apply'", function(){
      expect(resultsPage.getModalFacetOption('Text')).toBeDefined();
      resultsPage.applyModalFacetOption('Text');
      expect(resultsPage.getActiveFacetText(0)).toEqual("Text (Type)");
    });

    it("should change the active category when you click on a different category tab", function(){
      resultsPage.clickModalFacetTab(2);
      expect(resultsPage.activeModalTab.getText()).toEqual('Creator');
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
          if(val != "on"){
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
