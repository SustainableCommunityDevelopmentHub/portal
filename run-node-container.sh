# run-node-container.sh
# script to run and configure docker container for node

# -it allows for shell access, --rm prevents memory overflow issues
docker run -it --rm \
--name webserver \

# mount path script ran from to a volume in container
-v "$PWD":/usr/src/app \

# set the working inside container
-w /usr/src/app \

# docker image we are running
node:4.2.3 \

# correctly install node packages, correctly install bower...
# install bower packages and start server
bash -c "npm install --unsafe-perm && bower --allow-root install && node server.js"
