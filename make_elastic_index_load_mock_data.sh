#!/bin/bash
#load_elastic_mock_data.sh
#Initialize ES from outside the docker container: creates index and mapping
#Important: You should run this script via an npm script (see package.json)
#           This script expects to be run from the project root directory.

echo "Waiting for elasticsearch to get itself together...."
sleep 5
printf "Deleting existing index and data...\n"
curl -XDELETE http://local.portal.dev:9200/portal
sleep 2
echo "Creating portal index..."
curl -XPUT http://local.portal.dev:9200/portal -d @elastic_settings.json
sleep 2
printf "\n Creating book mapping...\n"
curl -XPUT http://local.portal.dev:9200/portal/_mapping/book -d @elastic_mapping.json
sleep 5
echo "Uploading sample data..."
curl -s -XPOST http://local.portal.dev:9200/_bulk --data-binary @mocks/batch_data/bnf_batch
curl -s -XPOST http://local.portal.dev:9200/_bulk --data-binary @mocks/batch_data/gri_marc21_batch
curl -s -XPOST http://local.portal.dev:9200/_bulk --data-binary @mocks/batch_data/inha_batch
curl -s -XPOST http://local.portal.dev:9200/_bulk --data-binary @mocks/batch_data/malaga_batch
curl -s -XPOST http://local.portal.dev:9200/_bulk --data-binary @mocks/batch_data/met_batch
curl -s -XPOST http://local.portal.dev:9200/_bulk --data-binary @mocks/batch_data/uh_batch

