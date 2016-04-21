(function() {
  'use strict';

  angular
  .module('app.core')
  .factory('FacetService', ['searchOptions', '_', FacetService]);


  function FacetService(searchOptions, _){
    /////////////////////////////////
    // Private Vars
    /////////////////////////////////
    var _this = this;
    var activeFacets = searchOptions.facets;
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
      clearFacetsIn: clearFacetsIn,
      activateFacet: activateFacet,
      deActivateFacet: deActivateFacet,
      getActiveFacets: getActiveFacets,
      buildFacet: buildFacet,
      getFacetCategoriesList: getFacetCategoriesList,

      // variables //
      config: getFacetConfigObj()
    };

    return service;

    function init(searchOptsFacets){
      this.activeFacets = searchOptsFacets;
    }

    //////////////////////////////////
    //Private Functions
    //////////////////////////////////
    function getDefaultDataStructure(){
      return {
        language: {
          options:[],
          active: []
        },
        subject: {
          options:[],
          active: []
        },
        creator: {
          options:[],
          active: []
        },
        grp_contributor: {
          options:[],
          active: []
        }
      };
    }

    function getFacetConfigObj(){
      return {
        language: {
          name: 'language',
          key: '_language',
          display: 'Language'
        },
        subject: {
          name: 'subject',
          key: '_subject_facets',
          rawKey: '_subject_facets.raw',
          display: 'Subject'
        },
        creator: {
          name: 'creator',
          key: '_creator_facet',
          rawKey: '_creator_facet.raw',
          display: 'Creator/Contributor'
        },
        grp_contributor: {
          name: 'grp_contributor',
          key: '_grp_contributor',
          rawKey: '_grp_contributor.raw',
          display: 'From'
        }
      };
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
     * Does not allow facet categories list to be modified
     */
    function getFacetCategoriesList(){
      return _.clone(facetCategoriesList);
    }

    function clearFacetsIn(category){
      if(category === 'all'){
        activeFacets = [];
        return true;

        // Use this instead if facet data struct is obj
        //facetCategoriesList.forEach(function(c){
          //activeFacets[c] = [];
        //});
        //return true;
      }

      if(isValidCategory(category)){
        var numFacetsRemoved = 0;
        // Use this instead if facet data struct is obj
        for(var i = 0; i < activeFacets.length; i++){
          if(activeFacets[i].category === category){
            activeFacets.splice(i, 1);
            numFacetsRemoved++;
          }
        }
        return numFacetsRemoved;
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
      if(!isValidFacet(facet)){
        return false;
      }
      facet.active = true;

      // This code is for if we want to use an arry to store all facets
      activeFacets.forEach(function(otherFacet){
        if(isSameFacet(facet, otherFacet)){
          otherFacet.active = true;
          return otherFacet;
        }
      });

      activeFacets.push(facet);
      console.log('FacetService::activateFacet -- activeFacets[] after new facet: ' + JSON.stringify(activeFacets));
      return facet;

      // This code is for if we want to use an obj to store facets by category
      //_this.getActiveFacets(facet.category).forEach(function(otherFacet){
        //if(isSameFacet(facet, otherFacet)){
          //return facet;
        //}
      //});
      //activeFacets[facet.category].push(facet);
      //return facet;
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
