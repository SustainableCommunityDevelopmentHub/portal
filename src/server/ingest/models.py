from datetime import date

from django.db import models



class Contributor(models.Model):
	identifier = models.CharField(max_length=50, primary_key=True)
	name = models.CharField(max_length=200)
	city = models.CharField(max_length=100, null=True)
	country = models.CharField(max_length=100, null=True)
	since = models.DateField()
	address = models.CharField(max_length=100, null=True)
	METHOD_CHOICES = (
		('OAI', 'OAI'),
		('FTP', 'FTP'),
		('MAN', 'Manual')
	)
	method = models.CharField(
		max_length = 3,
		choices = METHOD_CHOICES
	)
	FREQUENCY_CHOICES = (
		('QU', 'Quarterly'),
		('WE', 'Weekly'),
		('AN', 'As Needed')
	)
	frequency = models.CharField(
		max_length = 2,
		choices = FREQUENCY_CHOICES
	)

class Record(models.Model):
	identifier = models.CharField(max_length=50, primary_key=True)
	ingest_date = models.DateField()
	updated_date = models.DateField(null=True)
	contributor = models.ForeignKey(Contributor)
	source_path = models.CharField(max_length=200)
	SOURCE_SCHEMA_CHOICES = (
		('MA', 'MARC'),
		('DC', 'Dublin Core'),
		('ME', 'METS')
	)
	source_schema = models.CharField(
		max_length = 2,
		choices = SOURCE_SCHEMA_CHOICES
	)
