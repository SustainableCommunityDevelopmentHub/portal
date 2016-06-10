'use strict';


var FeedbackFormPage = function() {
  browser.get('/feedback');
};

FeedbackFormPage.prototype = Object.create({}, {
  inputFirstName: { value: function(name) {
    element(by.model('user.first_name')).sendKeys(name);
  }},
  inputLastName: { value: function(name) {
    element(by.model('user.last_name')).sendKeys(name);
  }},
  inputEmail: { value: function(email) {
    element(by.model('user.email')).sendKeys(email);
  }},
  inputConfirmationEmail: { value: function(email) {
    element(by.model('user.confirmation_email')).sendKeys(email);
  }},
  inputUserFeedback: { value: function(feedback) {
    element(by.model('user.user_feedback')).sendKeys(feedback);
  }},
  inputFirstName: { value: function(name) {
    element(by.model('user.first_name')).sendKeys(name);
  }},
  clickSubmit: { value: function() {
    element(by.id('feedback-submit')).click();
  }},
  submitRequiredFields: { value: function(name, email) {
    element(by.model('user.first_name')).sendKeys(name);
    element(by.model('user.last_name')).sendKeys(name);
    element(by.model('user.email')).sendKeys(email);
    element(by.model('user.confirmation_email')).sendKeys(email);
    element(by.model('user.user_feedback')).sendKeys(name);
    element(by.id('feedback-submit')).click();
  }},
  thankYou: { value: function() {
    return element(by.css('.thanks'));
  }},
  errorRequired: { value: function() {
    return element.all(by.css('.req')).get(0).evaluate('feedbackErrors[0].msg');
  }},
  errorInvalidEmail: { value: function() {
    return element.all(by.css('.invalid-email')).get(0).evaluate('feedbackErrors[1].msg');
  }},
  errorMismatch: { value: function() {
    return $('.mismatch-email').evaluate('feedbackErrors[2].msg');
  }}
});

module.exports = FeedbackFormPage;