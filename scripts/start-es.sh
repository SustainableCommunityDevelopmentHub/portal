#!/bin/bash
#adam cahan, acahan@getty.edu
#10/9/15
#Start elasticsearch docker container

#Check if container named 'elasticsearch' (or whatever ES_CONTAINER_NAME is set to) exists.
#If a container named 'elasticsearch' does exist, assume its our container and start it.

#If not, assume ES container has not been created from image.
#Go aheand and create ES container with proper settings and assign name.

ES_CONTAINER_NAME=elasticsearch

ES_CONTAINER_ID=$(docker ps -aq -f name=$ES_CONTAINER_NAME)
if [ $ES_CONTAINER_ID ]; then
    echo "Elasticsearch docker container exists. Starting container...."
    docker start $ES_CONTAINER_NAME;
else
    echo "Creating and starting elasticsearch docker container...."
    echo $ES_CONTAINER_NAME
    docker run -dit -p 9200:9200 -p 9300:9300 --name $ES_CONTAINER_NAME elasticsearch:1.7
fi
