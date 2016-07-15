from datetime import date

from django.db import models



class Record(models.Model):
	identifier = models.CharField(max_length=50, primary_key=True)
	path = models.CharField(max_length=200)
	ingest_date = models.DateField()
	updated_date = models.DateField(null=True)
	contributor = models.CharField(max_length=100)
	source_path = models.CharField(max_length=200)
	MARC = 'MA'
	DC = 'DC'
	METS = 'ME'
	SOURCE_SCHEMA_CHOICES = (
		(MARC, 'MARC'),
		(DC, 'Dublin Core'),
		(METS, 'METS')
	)
	source_schema = models.CharField(
		max_length=2,
		choices=SOURCE_SCHEMA_CHOICES
	)
