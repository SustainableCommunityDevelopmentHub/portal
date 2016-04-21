(function() {
  'use strict';


  angular
  .module('app.core')
  .value('activeFacets', {});

  angular
  .module('app.core')
  .factory('FacetService', ['activeFacets', '_', FacetService]);


  function FacetService(activeFacets, _){
    /////////////////////////////////
    // Private Vars
    /////////////////////////////////
    var _this = this;
    var facetCategoriesList = ['creator', 'grp_contributor', 'language', 'subject'];
    var facetCategoriesObj = getDefaultDataStructure();

    /////////////////////////////////
    // Expose Service
    /////////////////////////////////

    var service = {
      // functions //
      isValidCategory: isValidCategory,
      isValidFacet: isValidFacet,
      isSameFacet: isSameFacet,
      clearFacetCategory: clearFacetCategory,
      activateFacet: activateFacet,
      deActivateFacet: deActivateFacet,
      getActiveFacets: getActiveFacets,
      buildFacet: buildFacet,
      getFacetCategoriesList: getFacetCategoriesList
    };

    return service;

    //////////////////////////////////
    //Private Functions
    //////////////////////////////////
    function getDefaultDataStructure(){
      var obj = {};
      facetCategoriesList.forEach(function(c){
        obj[c] = [];
      });
      return obj;
    }

    function isValidCategory(category){
      if(facetCategoriesObj[category.toLowerCase()]){
        return true;
      }
      return false;
    }

    function isValidFacet(facet){
      if(!facet.category || !facet.value){
        return false;
      }
      if(!isValidCategory(facet.category)){
        return false;
      }
      return true;
    }

    function isSameFacet(facetA, facetB){
      if(facetA.category.toLowerCase() !== facetB.category.toLowerCase()){
        return false;
      }
      if(facetA.value.toLowerCase() !== facetB.value.toLowerCase()){
        return false;
      }
      return true;
    }

    //////////////////////////////////
    //Public Functions
    //////////////////////////////////

    /**
     * @return {array} string arr of facet categories
     */
    function getFacetCategoriesList(){
      return _.clone(facetCategoriesList);
    }

    function clearFacetCategory(category){
      if(category === 'all'){
        facetCategoriesList.forEach(function(c){
          activeFacets[c] = [];
        });
        return true;
      }

      if(isValidCategory(category)){
        activeFacets[category] = [];
        return true;
      }

      return false;
    }

    function getActiveFacets(category){
      if(category === 'all'){
        var all = [];
        facetCategoriesList.forEach(function(c){
          all = all.concat(activeFacets[c]);
        });
        return all;
      }

      if(isValidCategory(category)){
        return activeFacets[category];
      }

      return false;
    }

    /**
     * Returns false if facet is already active
     * Returns true if facet was successfully activated
     */
    function activateFacet(facet){
      _this.getActiveFacets(facet.category).forEach(function(existingFacet){
        if(isSameFacet(facet, existingFacet)){
          existingFacet.active = true;
          return true;
        }
      });
      activeFacets[facet.category].push(facet);
      return true;
    }

    function deActivateFacet(facet){
      var facets = _this.getActiveFacets(facet.category);
      _.remove(facets, function(f){
        return isSameFacet(facet, f);
      });
    }

    /**
     * Construct a facet object
     * @param {string} category valid facet cateogry - required
     * @param {string} value such as 'art' or 'picasso' - required
     * @param {int} count can be null - number of hits associated w/this facet - optional
     * @param {boolean} active if facet is active or not- optional
     */
    function buildFacet(category, value, count, active){
      if(!isValidCategory(category) || !value){
        return false;
      }

      return {
        category: category,
        value: value,
        count: count || null,
        active: active || null
      };
    }

  }
})();
