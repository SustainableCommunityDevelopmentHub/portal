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
  .directive('focusInput', function(){
    return function(scope, elem, attr){
      $(document).on("click", function(e) {
        if (!$(e.target).hasClass("facet-search")) {
          if(elem.hasClass('input-div-focus')){
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