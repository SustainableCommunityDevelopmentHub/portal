#!/bin/bash
#adam cahan, acahan@getty.edu
#10/9/15
#Start elasticsearch docker container

#Behavior:
#Don't continue script if container already running...
#Check if container named 'elasticsearch' (or whatever ES_CONTAINER_NAME is set to) exists.
#If a container named 'elasticsearch' does exist, assume its our container and start it.
#If not, assume ES container has not been created from image.
#Go ahead and create ES container with proper settings and assign name.

ES_CONTAINER_NAME=elasticsearch
ES_CONTAINER_ID=$(docker ps -aq -f name=$ES_CONTAINER_NAME)

if [ -z $(docker ps -q -f name=$ES_CONTAINER_NAME) ];
then
    if [ $ES_CONTAINER_ID ]; then
        echo "Elasticsearch docker container exists. Starting container...."
        docker start $ES_CONTAINER_NAME;
        echo $ES_CONTAINER_ID
    else
        echo "Creating and starting elasticsearch docker container...."
        echo $ES_CONTAINER_ID

        #Use ES's JAVA_OPTS (-Des) arg to enable CORS -- NOTE: REVIEW BEFORE GOING INTO PRODUCTION
        docker run -dit -p 9200:9200 -p 9300:9300 --name $ES_CONTAINER_NAME elasticsearch:1.7 -Des.http.cors.enabled=true
    fi
fi

