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

**Note:** for production you should use the server's IP address instead of localhost

3. Restart the system

        sudo /etc/init.d/elasticsearch restart

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

You should get back 6 hits