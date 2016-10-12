# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ingest', '0004_auto_20160831_1828'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contributor',
            name='address',
            field=models.CharField(max_length=100, null=True),
        ),
    ]
