/**
 * Created by jfranco on 3/2/16.
 */
"use strict"

describe('Storage Service', function(){
  var StorageService, testItem, testKey;

  beforeEach(function(){
    module('ui.router');
    module('ui.bootstrap');
    module('elasticsearch');
    module('app.core');
    module('app');
    module('app.search');
  });

  beforeEach(inject(function(_StorageService_) {
    StorageService = _StorageService_;
  }));

  beforeEach(function() {
    testItem = {StorageService: ["test"]};
    testKey = "StorageService";
  });

  afterEach(function() {
    localStorage.removeItem(testKey);

  });

  it('should save items to localStorage', function() {

    var s = JSON.stringify(testItem);
    StorageService.setItem(testKey, s);

    var item = localStorage.getItem(testKey);
    var itemAsJSON = JSON.parse(item);
    expect(itemAsJSON).toEqual(testItem);
  });

  it('should get items from localStorage', function() {
    var s = JSON.stringify(testItem);
    localStorage.setItem(testKey, s);
    var item = StorageService.getItems(testKey);
    item = JSON.parse(item);
    expect(item).toEqual(testItem);
  })
})