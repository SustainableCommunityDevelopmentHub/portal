'use strict';

var BookDetailPage = function() {

};

BookDetailPage.prototype = Object.create({}, {
  clickBookmark: { value: function(position) {
    element.all(by.css('.item-details .bookmark')).get(position).click();
  }}
});

module.exports = BookDetailPage;