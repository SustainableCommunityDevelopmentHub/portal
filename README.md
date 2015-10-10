Getty Research Portal
=====================

*******************************

Dependencies
------------
### Java 7
To install on Ubuntu:

    sudo add-apt-repository ppa:webupd8team/java
    sudo apt-get update
    sudo apt-get install oracle-java8-installer
    sudo apt-get install oracle-java8-set-default

Check your version:

    java -version

### ElasticSearch
To install ES on Ubuntu:

1. Download and install the Public Signing Key

        wget -qO - https://packages.elasticsearch.org/GPG-KEY-elasticsearch | sudo apt-key add -

2. Add the following to your /etc/apt/sources.list to enable the repository

        sudo add-apt-repository "deb http://packages.elasticsearch.org/elasticsearch/1.4/debian stable main"

3. Run apt-get update and the repository is ready for use. You can install it with :

        sudo apt-get update && sudo apt-get install elasticsearch

4. Configure Elasticsearch to automatically start during bootup :

        sudo update-rc.d elasticsearch defaults 95 10

### Nodejs
To install on Ubuntu:

    sudo apt-get install nodejs

*******************************

Setup
-----
###Configure ElasticSearch
Create the Portal index

    curl -XPUT localhost:9200/portal

Enable CORS for the system

1. open the system yml file

        sudo vim /etc/elasticsearch/elasticsearch.yml

2. add the following lines to the bottom

        http.cors.enabled: true
        http.cors.allow-origin: /https?:\/\/localhost(:[0-9]+)?/

3. Restart the system

        sudo /etc/init.d/elasticsearch restart

**Note:** for production you should use the server's IP address instead of localhost

Load the sample data

    curl -s -XPOST localhost:9200/_bulk --data-binary @sample_data/sample_load; echo

###Install JavaScript dependencies

    npm install

*******************************

Running
-------
###Start the development web server

    npm start

The application should now be running on port 8000

Open your browser to localhost:8000/app

Enter a search for "history" and click the Search button (click twice)

*******************************

Instructions for Docker
_______________________

# Create Docker Hub Account
# Launch boot2docker

1. Pull portal image

        docker pull sley/portal:v2

2. Create and start container using image

        docker run -t -i -p 9200:9200 -p 8000:8000 sley/portal:v2 /bin/bash

3. Login as user "getty"

        login
        getty
        password: getty321

4. cd to portal directory

        cd portal/portal

5. Restart Elasticsearch

        sudo /etc/init.d/elasticsearch restart

6. Load the sample data

        curl -s -XPOST 192.168.59.103:9200/_bulk --data-binary @sample_data/frick_batch; echo

7. Start development web server

        npm start

Look at 192.168.59.103:8000/app/ in browser.

Configuration
-------------

The config setting es.host in config/default.json should be set to the IP address of your docker machine. You can check the address of your machine by running `docker-machine ip YourMachineNameHere`. You can run docker-machine ls` to see a list of all docker machines if you don't know your machine name.

If es.host is not set to your docker machine's IP, create a file named local.json in the config/ directory. This file is just for you, and any settings in it override those in default.json. In this case, it should look like this:
    {
        "es": {
            "host": "YourMachineIPAddressHere"
        }
    }

local.json is included in the .gitignore file, so it is not tracked in version control.


Workflow and Contributing Code
------------------------------

The two main branches are _develop_ and _master_. All work on features, etc, should be done by branching off develop.
All pull requests should be to the develop branch. Branches are merged into develop, which, after testing, is merged into master and pushed to production.
The source code on master should always be production-ready.

