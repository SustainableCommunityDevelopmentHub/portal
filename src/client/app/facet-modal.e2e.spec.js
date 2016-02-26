describe("Facet Modal", function(){
  var searchBtn = element(by.id('go-btn'));
  var testQuery = "painting";

  beforeEach(function() {
    browser.get('');
    element(by.model('queryTerm')).sendKeys(testQuery);
    searchBtn.click();
  });

  it("should open modal window with previously checked facets checked", function(){
    var tab = element.all(by.css(".left_sidebar_accordion__tab")).get(1);
    tab.click();
    var facet = element(by.id("Exhibitions-sidebar"));
    facet.click();

    element(by.id("see-all-subject")).click();

    var modalFacet = element(by.id("Exhibitions"));
    expect(modalFacet.getAttribute("value")).toEqual("on");
  });


  describe("tests launching modal from 'Type' category", function(){
    beforeEach(function(){
      var tab = element.all(by.css(".left_sidebar_accordion__tab")).get(0);
      tab.click();
      element(by.id("see-all-type")).click();
    });

    it("should apply checked filters when you click 'Apply'", function(){
      var label = element(by.id("Text"));

      expect(label).toBeDefined();
      var facetText = label.getText();
      label.click();

      element(by.css(".apply-btn")).click();
      var facet = $(".facet ul li");
      expect(facet.getText()).toEqual("Text");
    });

    it("should change the active category when you click on a different category tab", function(){
      var newTab = element.all(by.css(".facet-tabs li")).get(2);
      newTab.click();
      var activeCategoryTab = element(by.css('.active-facet-tab'));
    
      expect(newTab.getText()).toEqual(activeCategoryTab.getText());
    });

  });

  describe("tests launching modal from 'Subject' category", function(){

    beforeEach(function(){
      var tab = element.all(by.css(".left_sidebar_accordion__tab")).get(1);
      tab.click();
      element(by.id("see-all-subject")).click();
    });

    it("should open with the category you clicked 'See All' from", function(){
      var active = element(by.css(".active-facet-tab"));
      expect(active.getText()).toEqual("Subject");
    });

    it("should add indicator to category tab when facet is checked", function(){
      var labels = element.all(by.css(".filter-labels"));
      labels.get(0).click();

      var categoryTab = element(by.css('.selected-facet-tabs'));
      expect(categoryTab).toBeDefined();
      expect(categoryTab.getText()).toEqual("Subject");
    });

    it("should display only checked facets when 'See Only Checked' is clicked", function(){
      var checkboxes = element.all(by.css(".filter-checkboxes label"));
      var initialCount = checkboxes.count();
      checkboxes.get(0).click();
      checkboxes.get(3).click();
      checkboxes.get(4).click();

      var toggle = element(by.css(".checked-filters a"));
      toggle.click();

      checkboxes = element.all(by.css(".filter-checkboxes label"));
      expect(checkboxes.count()).toBe(3);
      var allChecked = true;
      checkboxes.each(function(checkbox){
        checkbox.getAttribute("value").then(function(val){
          if(val != "on"){
            allChecked = false;
          }
        });
      });
      expect(allChecked).toBe(true);

      toggle.click();
      checkboxes = element.all(by.css(".filter-checkboxes label"));
      expect(checkboxes.count()).toEqual(initialCount);
    });

    it("should filter checkboxes after typing in search text box", function(){
      var checkboxes = element.all(by.css(".filter-checkboxes label"));
      var initialCount = checkboxes.count();

      var searchBox = element(by.css('.search-filters'));
      var filteredTerm = "paint";
      searchBox.sendKeys(filteredTerm);

      checkboxes = element.all(by.css(".filter-checkboxes label"));
      var containsFilteredTerm = true;
      checkboxes.each(function(checkbox){
        checkbox.getText().then(function(text){
          if(text.indexOf(filteredTerm) < 0){
            containsFilteredTerm = false;
          }
        });
      });
      expect(containsFilteredTerm).toBe(true);
    });

    it("should not apply checked filters if 'X' button clicked", function(){
      var checkboxes = element.all(by.css(".filter-checkboxes label"));
      checkboxes.get(0).click();
      checkboxes.get(1).click();

      var closeButton = element(by.css(".close-modal"));
      closeButton.click();

      var facets = element.all(by.css(".facet ul li"));
      expect(facets.count()).toBe(0);
    });
  });
});
