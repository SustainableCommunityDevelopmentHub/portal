'use strict';

var FeedbackFormPage = require('../page_objects/feedback-form.page.js');

describe('Feedback', function() {

  var feedbackFormPage;

  beforeEach(function() {
    feedbackFormPage = new FeedbackFormPage();
  });

  var userName = 'Bert';
  var validEmail = 'bert@getty.edu';
  var diffEmail = 'ernie@getty.edu';


  it('should return field required errors on submit', function() {
    feedbackFormPage.inputEmail(validEmail);
    feedbackFormPage.inputConfirmationEmail(validEmail);
    feedbackFormPage.clickSubmit();
    expect(feedbackFormPage.errorRequired()).toEqual('This field is required.');
  });

  it('should return invalid email error on submit', function() {
    feedbackFormPage.inputFirstName(userName);
    feedbackFormPage.inputLastName(userName);
    feedbackFormPage.inputEmail(userName);
    feedbackFormPage.inputConfirmationEmail(userName);
    feedbackFormPage.inputUserFeedback(userName);
    feedbackFormPage.clickSubmit();
    expect(feedbackFormPage.errorInvalidEmail()).toEqual('Please enter a valid email address.');
  });

  it('should return email mismatch error on submit', function() {
    feedbackFormPage.inputFirstName(userName);;
    feedbackFormPage.inputLastName(userName);
    feedbackFormPage.inputEmail(validEmail);
    feedbackFormPage.inputConfirmationEmail(diffEmail);
    feedbackFormPage.inputUserFeedback(userName);
    feedbackFormPage.clickSubmit();
    expect(feedbackFormPage.errorMismatch()).toEqual('Email addresses do not match.');
  });
  
});