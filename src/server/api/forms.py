from django import forms
from django.core import validators
from django.core.exceptions import ValidationError
from django.utils.translation import ugettext_lazy as _



class ContactForm(forms.Form):
    first_name = forms.CharField(label='First name', max_length=100, required=True, 
    	error_messages={'required': 'Please enter your first name.'})
    last_name = forms.CharField(label='Last name', max_length=100, required=True, 
    	error_messages={'required': 'Please enter your last name.'})
    email = forms.EmailField(label='Email', required=True)
    confirmation_email = forms.EmailField(label='Confirm email', required=True)
    organization = forms.CharField(required=False)
    TYPES = (('Question', 'Problem'), ('Question', 'Question'), ('Comment', 'Comment'),)
    type_of_feedback = forms.CharField(label='I have a', widget=forms.Select(choices=TYPES))
    user_feedback = forms.CharField(label='Feedback', widget=forms.Textarea, required=True)

    def clean(self):
        cleaned_data = super(ContactForm, self).clean()
        email = cleaned_data.get('email')
        confirmation_email = cleaned_data.get('confirmation_email')

        if email != confirmation_email:
            self._errors['confirmation_email'] = self.error_class(['Emails do not match.'])
            del self.cleaned_data['confirmation_email']
        return cleaned_data