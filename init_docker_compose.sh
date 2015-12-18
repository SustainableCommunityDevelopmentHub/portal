docker-compose run --service-ports webserver \

# -it allows for shell access, --rm prevents memory overflow issues
# -it --rm \
# --name webserver \

# mount path script ran from to a volume in container
-v "$PWD":/usr/src/app \

# set the working directory inside container
-w /usr/src/app \

# correctly install node packages, correctly install bower...
# install bower packages and start server
bash -c "npm install --unsafe-perm && bower --allow-root install && node server.js"
