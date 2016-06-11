#!/bin/bash
# django_init.sh
# build python virtual environment start django server.
# run this script from project root directory.

pyvenv-3.5 ENV
source ENV/bin/activate
pip install -r requirements.txt
cd src/server
python manage.py runserver

