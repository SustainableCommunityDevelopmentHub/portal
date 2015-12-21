#!/bin/bash
#Initialize ES from outside the docker container: make index, add sample data, etc, start ES.

echo "Waiting for elasticsearch to get itself together...."
sleep 5
echo "Creating portal index..."
curl -XPUT http://local.portal.dev:9200/portal
sleep 2
echo "Uploading sample data..."
curl -s -XPOST http://local.portal.dev:9200/_bulk --data-binary @mocks/gri_marc21_batch
