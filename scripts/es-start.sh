#!/bin/bash
#adam cahan, acahan@getty.edu
#10/9/15
#Start elasticsearch docker container

#NOTE: This script assumes it is being run from project root (for mounting docker data volumes, for es config
#      file) and will break otherwise.

ES_CONTAINER_NAME=elasticsearch
ES_CONTAINER_ID=$(docker ps -aq -f name=$ES_CONTAINER_NAME)


#Don't continue script if container already running...
if [ -z $(docker ps -q -f name=$ES_CONTAINER_NAME) ];
then
    #Check if container named 'elasticsearch' (or whatever ES_CONTAINER_NAME is set to) exists.
    if [ $ES_CONTAINER_ID ]; then
        #If a container named 'elasticsearch' does exist, assume its our container and start it.
        echo "Elasticsearch docker container exists. Starting container...."
        docker start $ES_CONTAINER_NAME;
        echo $ES_CONTAINER_ID
    else
        #If not, assume ES container has not been created from image.
        echo "Creating and starting elasticsearch docker container...."
        echo $ES_CONTAINER_ID

        #Go ahead and create ES container with proper settings and assign name. Name needed for script to work.
        docker run -dit -p 9200:9200 -p 9300:9300 --name $ES_CONTAINER_NAME elasticsearch:1.7

        #Set volume for ES container for elasticsearch.yml config file -- Work in progress
        #docker run -dit -p 9200:9200 -p 9300:9300 -v $(pwd)/mount/elastic_config:/user/share/elasticsearch/config --name $ES_CONTAINER_NAME elasticsearch:1.7

        #Enable CORS with command line arg -- Work in progress
        docker run -it -p 9200:9200 -p 9300:9300 --name $ES_CONTAINER_NAME elasticsearch:1.7 -Des.http.cors.enabled=true
    fi
fi

