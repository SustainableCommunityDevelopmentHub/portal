(function() {
  'use strict';

  angular
  .module('app.search')
  .directive('adjustSize', function(){
    return function(scope, elem, attr){
      elem.bind("keyup", function(){
        var width = elem.val().length;
        if (width > 3){
          var newWidth = 100 + (width * 5);
          elem.css('width', newWidth + 'px');
        }
      });
    };
  })
  .directive('focusHomeSearch', function() {
    return function(scope, elem, attr){
      elem[0].querySelector('.search-input').focus();
    };
  })
  .directive('focusSearchOnLoad', function() {
    return function(scope, elem, attr){
      elem[0].querySelector('#facet-chip-input').focus();
      elem.addClass('input-div-focus');
    };
  })
  .directive('focusSearchInput', function(){
    return function(scope, elem, attr){
      elem[0].querySelector('#facet-chip-input').focus();
      elem.addClass('input-div-focus');

      $(document).on("click", function(e) {
        if (!$(e.target).hasClass("facet-search") && !$(e.target).is("a") && !$(e.target).is("button") && e.target.type !== "checkbox") {
          if(elem.hasClass('input-div-focus')){
            console.log("removing focus");
            elem.removeClass('input-div-focus');
          }          
        }
      });
      elem.bind("click", function(){
        var input = elem[0].querySelector('#facet-chip-input');
        input.focus();
        elem.addClass('input-div-focus');
      });
    };
  });
})();