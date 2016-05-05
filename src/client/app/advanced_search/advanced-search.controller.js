(function() {
  'use strict';

  angular
  .module('app.advanced-search')
  .controller('AdvancedSearchCtrl', ['$scope', '$state', 'SearchService', 'ADVANCED_SEARCH', AdvancedSearchCtrl]);

  function AdvancedSearchCtrl($scope, $state, SearchService, ADVANCED_SEARCH){
    $scope.filters = [];
    $scope.fields = [];
    $scope.queryTerm = "";

    $scope.addFilter = addFilter;
    $scope.selectField = selectField;
    $scope.search = search;

    var searchService = SearchService;
    var initialField = {display: "- Select Field -", searchKey: ""};

    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      $scope.filters = [{field: initialField, text: "", lastFilter: true}];
      $scope.fields = [
          ADVANCED_SEARCH.title,
          ADVANCED_SEARCH.creator,
          ADVANCED_SEARCH.date,
          ADVANCED_SEARCH.language,
          ADVANCED_SEARCH.subject,
          ADVANCED_SEARCH.contributor,
        ];
    });

    /**
     * Adds new filter object to the filters array, which angular will use to render out
     * another input box and dropdown menu for the new field
     */
    function addFilter() {
      var newFilter = {
        field: initialField,
        text: "",
        lastFilter: true
      };
      $scope.filters[$scope.filters.length - 1].lastFilter = false;
      $scope.filters.push(newFilter);
    }

    /**
     * Sets filter object's field to the one selected in the drop-down menu.
     * @param {Object} filter - the filter object containing the data for the menu and input box
     * @param {Object} field - the field object containing display and elastic search data
     */
    function selectField(filter, field) {
      filter.field = field;
    }

    /**
     * Runs search with keywords and filters as provided by user.
     * First processes filters to include only those with field selected and keywords.
     * Adds those items to an opts object and calls SearchService with those opts.
     * Then transitions to Search Results state.
     */
    function search() {
      var opts = {
        q: "",
        advancedFields: []
      };
      $scope.filters.forEach(function(filter){
        if(filter.text && filter.field !== initialField){
          var f = {field: filter.field, term: filter.text};
          opts.advancedFields.push(f);
        }
      });
      opts.q = $scope.queryTerm;
      searchService.resetOpts();
      searchService.updateOpts(opts);
      $state.go('searchResults', searchService.opts);
    }
  }
})();
