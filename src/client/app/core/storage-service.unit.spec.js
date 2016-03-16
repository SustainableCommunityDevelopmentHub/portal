"use strict";

describe('Storage Service', function(){
  var StorageService, testItem, testKey;

  beforeEach(function(){
    module('app.core');
  });

  beforeEach(inject(function($rootScope, _StorageService_) {
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
  });
});