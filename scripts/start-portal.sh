#!/bin/bash
#Run docker container for portal development environment and log user in as root.
#IMPORTANT: This must be run from the host machine's project directory in order to properly mount project files
#           on the docker container.

docker run -ti -p 9200:9200 -p 8000:8000 -v $(pwd):/home/getty/portal sley/portal:v2 /bin/bash
