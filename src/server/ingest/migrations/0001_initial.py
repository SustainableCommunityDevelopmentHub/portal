# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Title',
            fields=[
                ('id', models.AutoField(primary_key=True, verbose_name='ID', serialize=False, auto_created=True)),
                ('identifier', models.CharField(max_length=50)),
                ('path', models.CharField(max_length=200)),
                ('contributor', models.CharField(max_length=100)),
                ('source_path', models.CharField(max_length=200)),
                ('source_schema', models.CharField(max_length=2, choices=[('MA', 'MARC'), ('DC', 'Dublin Core'), ('ME', 'METS')])),
            ],
        ),
    ]
