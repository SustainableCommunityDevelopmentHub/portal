#!/bin/bash
#Initialize ES from outside the docker container: make index, add sample data, etc, start ES.

echo "Waiting for elasticsearch to get itself together...."
sleep 5
printf "Deleting existing index and data...\n"
curl -XDELETE http://local.portal.dev:9200/portal
sleep 2
echo "Creating portal index..."
curl -XPUT http://local.portal.dev:9200/portal
sleep 2
printf "\n Creating book mapping...\n"
curl -XPUT http://local.portal.dev:9200/portal/_mapping/book -d @es_mapping_book.json
sleep 5
echo "Uploading sample data..."
curl -s -XPOST http://local.portal.dev:9200/_bulk --data-binary @mocks/gri_marc21_batch
curl -s -XPOST http://local.portal.dev:9200/_bulk --data-binary @mocks/bnf_batch
curl -s -XPOST http://local.portal.dev:9200/_bulk --data-binary @mocks/inha_batch
curl -s -XPOST http://local.portal.dev:9200/_bulk --data-binary @mocks/malaga_batch
curl -s -XPOST http://local.portal.dev:9200/_bulk --data-binary @mocks/met_batch
curl -s -XPOST http://local.portal.dev:9200/_bulk --data-binary @mocks/uh_batch
