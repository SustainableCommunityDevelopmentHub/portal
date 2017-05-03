# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ingest', '0005_auto_20160831_1835'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contributor',
            name='city',
            field=models.CharField(null=True, max_length=100),
        ),
        migrations.AlterField(
            model_name='contributor',
            name='country',
            field=models.CharField(null=True, max_length=100),
        ),
    ]
