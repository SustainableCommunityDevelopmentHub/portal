# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import datetime
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('ingest', '0002_auto_20160707_2230'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='record',
            name='id',
        ),
        migrations.AddField(
            model_name='record',
            name='ingest_date',
            field=models.DateField(default=datetime.datetime(2016, 7, 11, 18, 27, 22, 755088, tzinfo=utc)),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='record',
            name='updated_date',
            field=models.DateField(null=True),
        ),
        migrations.AlterField(
            model_name='record',
            name='identifier',
            field=models.CharField(serialize=False, max_length=50, primary_key=True),
        ),
    ]
