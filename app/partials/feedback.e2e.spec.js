// feedback.e2e.spec.js
describe('Feedback', function() {


  var userName = 'Bert';
  var validEmail = 'bert@getty.edu';
  var diffEmail = 'ernie@getty.edu';
  var errorReq = $('.req').evaluate('feedbackErrors[0].msg');
  var errorInvalidEmail = $('.invalid-email').evaluate('feedbackErrors[1].msg');
  var errorMisMatch = $('.mismatch-email').evaluate('feedbackErrors[2].msg');
  var firstField = element(by.model('user.firstName'));

    

  it('should return field required errors on submit', function() {
    browser.get('feedback');
    element(by.model('user.email')).sendKeys('validEmail');
    element(by.model('user.confirmationEmail')).sendKeys('validEmail');
    expect(errorReq).toEqual('This field is required.');
  });

  it('should return invalid email error on submit', function() {
    browser.get('feedback');
    element(by.model('user.firstName')).sendKeys(userName);
    element(by.model('user.lastName')).sendKeys(userName);
    element(by.model('user.email')).sendKeys(userName);
    element(by.model('user.confirmationEmail')).sendKeys(userName);
    element(by.model('user.feedback')).sendKeys(userName);
    expect(errorInvalidEmail).toEqual('Please enter a valid email address.');
  });

  it('should return email mismatch error on submit', function() {
    browser.get('feedback');
    element(by.model('user.firstName')).sendKeys(userName);
    element(by.model('user.lastName')).sendKeys(userName);
    element(by.model('user.email')).sendKeys(validEmail);
    element(by.model('user.confirmationEmail')).sendKeys(diffEmail);
    element(by.model('user.feedback')).sendKeys(userName);
    expect(errorMismatch).toEqual('Email addresses do not match.');
  });

  it('should display no errors if form valid', function() {
    browser.get('feedback');
    element(by.model('user.firstName')).sendKeys(userName);
    element(by.model('user.lastName')).sendKeys(userName);
    element(by.model('user.email')).sendKeys(validEmail);
    element(by.model('user.confirmationEmail')).sendKeys(validEmail);
    element(by.model('user.feedback')).sendKeys(userName);
    expect(errorReq.isPresent()).toBeFalsy();
    expect(errorInvalidEmail.isPresent()).toBeFalsy();
    expect(errorMismatch.isPresent()).toBeFalsy();
  });

  
});