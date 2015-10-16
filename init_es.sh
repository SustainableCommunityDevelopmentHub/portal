#!/bin/bash
#Initialize ES inside the docker container: make index, add sample data, etc

echo "Waiting for elasticsearch to get itself together...."
sleep 10
echo "Creating portal index..."
curl -XPUT http://localhost:9200/portal
sleep 2
echo "Uploading sample data..."
curl -s -XPOST http://localhost:9200/_bulk --data-binary @sample_data/frick_batch
