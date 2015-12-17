#!/bin/bash
#Initialize ES inside the docker container: make index, add sample data, etc, start ES.

printf "Starting elasticsearch...\n"
/etc/init.d/elasticsearch start
printf "\n Waiting for elasticsearch to get itself together....\n"
sleep 10
printf "Deleting existing index and data...\n"
curl -XDELETE http://localhost:9200/portal
sleep 2
printf "\n Creating portal index...\n"
curl -XPUT http://localhost:9200/portal
sleep 2
printf "\n Creating book mapping...\n"
curl -XPUT http://localhost:9200/portal/_mapping/book -d @es_mapping_book.json
sleep 2
printf "\n Uploading sample data...\n"
curl -s -XPOST http://localhost:9200/_bulk --data-binary @mocks/gri_marc21_batch
printf "\n"
