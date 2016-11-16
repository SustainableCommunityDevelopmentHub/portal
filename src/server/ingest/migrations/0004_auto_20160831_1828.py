# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ingest', '0003_auto_20160711_1827'),
    ]

    operations = [
        migrations.CreateModel(
            name='Contributor',
            fields=[
                ('identifier', models.CharField(serialize=False, primary_key=True, max_length=50)),
                ('name', models.CharField(max_length=200)),
                ('city', models.CharField(max_length=100)),
                ('country', models.CharField(max_length=100)),
                ('since', models.DateField()),
                ('address', models.CharField(max_length=100)),
                ('method', models.CharField(choices=[('OAI', 'OAI'), ('FTP', 'FTP'), ('MAN', 'Manual')], max_length=3)),
                ('frequency', models.CharField(choices=[('QU', 'Quarterly'), ('WE', 'Weekly'), ('AN', 'As Needed')], max_length=2)),
            ],
        ),
        migrations.RemoveField(
            model_name='record',
            name='path',
        ),
        migrations.AlterField(
            model_name='record',
            name='contributor',
            field=models.ForeignKey(to='ingest.Contributor'),
        ),
    ]
