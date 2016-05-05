// feedback.e2e.spec.js
describe('Feedback', function() {


  var userName = 'Bert';
  var validEmail = 'bert@getty.edu';
  var diffEmail = 'ernie@getty.edu';


  it('should return field required errors on submit', function() {
    browser.get('feedback');
    element(by.model('user.email')).sendKeys('validEmail');
    element(by.model('user.confirmationEmail')).sendKeys('validEmail');
    element(by.id('feedback-submit')).click();
    var errorReq = $('.req').evaluate('feedbackErrors[0].msg');
    expect(errorReq).toEqual('This field is required.');
  });

  it('should return invalid email error on submit', function() {
    browser.get('feedback');
    element(by.model('user.firstName')).sendKeys(userName);
    element(by.model('user.lastName')).sendKeys(userName);
    element(by.model('user.email')).sendKeys(userName);
    element(by.model('user.confirmationEmail')).sendKeys(userName);
    element(by.model('user.yourFeedback')).sendKeys(userName);
    element(by.id('feedback-submit')).click();
    var errorInvalidEmail = $('.invalid-email').evaluate('feedbackErrors[1].msg');
    expect(errorInvalidEmail).toEqual('Please enter a valid email address.');
  });

  it('should return email mismatch error on submit', function() {
    browser.get('feedback');
    element(by.model('user.firstName')).sendKeys(userName);
    element(by.model('user.lastName')).sendKeys(userName);
    element(by.model('user.email')).sendKeys(validEmail);
    element(by.model('user.confirmationEmail')).sendKeys(diffEmail);
    element(by.model('user.yourFeedback')).sendKeys(userName);
    element(by.id('feedback-submit')).click();
    var errorMismatch = $('.mismatch-email').evaluate('feedbackErrors[2].msg');
    expect(errorMismatch).toEqual('Email addresses do not match.');
  });

  it('should display no errors if form valid', function() {
    browser.get('feedback');
    element(by.model('user.firstName')).sendKeys(userName);
    element(by.model('user.lastName')).sendKeys(userName);
    element(by.model('user.email')).sendKeys(validEmail);
    element(by.model('user.confirmationEmail')).sendKeys(validEmail);
    element(by.model('user.yourFeedback')).sendKeys(userName);
    element(by.id('feedback-submit')).click();
    var errorReq = $('.req').evaluate('feedbackErrors[0].msg');
    var errorInvalidEmail = $('.invalid-email').evaluate('feedbackErrors[1].msg');
    var errorMismatch = $('.mismatch-email').evaluate('feedbackErrors[2].msg');
    expect(errorReq.isDisplayed()).toBeFalsy();
    expect(errorInvalidEmail.isDisplayed()).toBeFalsy();
    expect(errorMismatch.isDisplayed()).toBeFalsy();
  });

  
});