Getty Research Portal
=====================
*******************************


Running the Application
------------------------

1. Make sure you have a docker virtual machine running. Use `docker-machine ls` to check the status of your docker machines. `docker-machine --help` will provide a handy list of all available commands.

2. *In your project directory,* start the portal container with `docker start portal_dev`. You can also use `docker ps` to see a list of all active containers. 

3. Start the development web server: `npm start`

The application should now be running on port 8000

Open your browser to localhost:8000/app

Enter a search for "history" and click the Search button (click twice)

*******************************


Setup
_______________________

###Install Docker Toolbox

The recommended way to install Docker on OS X is using homebrew cask (or Macports) to install the docker toolbox.
If you don't have either one of these, go [here](http://http://brew.sh/) for homebrew install instructions and description.

Once you have homebrew, to install homebrew cask:
        brew update
        brew install caskroom

Then use it to install Docker Toolbox:
        brew cask install dockertoolbox


###Create docker image for portal app

1. Create an account on docker hub. 

2. Start a docker machine:
        docker-machine start default

###Build and configure Docker Container       
1. Pull docker image for the portal app.

        docker pull sley/portal:v2

2. On your host machine create a project directory.

        git clone https://github.com/gri-is/portal.git

3. *From your project directory, i.e. myprojects/portal* create and start the docker container. This will also mount your project directory as a data volume on the container.
        
        docker run -ti -p 9200:9200 -p 8000:8000 -v $(pwd):/portal/portal --name portal_dev sley/portal:v2 /bin/bash 

3. Login as user "getty" with password: getty321

        login
     
4. cd to portal directory. 

        cd portal/portal

#Configuring elasticsearch in the docker container
5. Create the Portal index

    curl -XPUT localhost:9200/portal

Enable CORS for elasticsearch.

6. Open the elasticsearch config file

        sudo vim /etc/elasticsearch/elasticsearch.yml

7. Add the following lines to the bottom

        http.cors.enabled: true
        http.cors.allow-origin: /https?:\/\/localhost(:[0-9]+)?/

8. Restart elasticsearch.

        sudo /etc/init.d/elasticsearch restart

9. Load the sample data

        curl -s -XPOST 192.168.59.103:9200/_bulk --data-binary @sample_data/frick_batch; echo

10. Start development web server

        npm start

Look at 192.168.59.103:8000/app/ in browser.













Setup
-----
###Configure elasticSearch in the docker container
Create the Portal index

    curl -XPUT localhost:9200/portal

Enable CORS for elasticsearch.

1. open the elasticsearch config file

        sudo vim /etc/elasticsearch/elasticsearch.yml

2. add the following lines to the bottom

        http.cors.enabled: true
        http.cors.allow-origin: /https?:\/\/localhost(:[0-9]+)?/

3. Restart elasticsearch

        sudo /etc/init.d/elasticsearch restart

**Note:** for production you should use the server's IP address instead of localhost

Load elasticsearch sample data

    curl -s -XPOST localhost:9200/_bulk --data-binary @sample_data/sample_load; echo

###Install Node.js modules

    npm install

*******************************


Workflow and Contributing Code
------------------------------

The two main branches are _develop_ and _master_. All work on features, etc, should be done by branching off develop.
All pull requests should be to the develop branch. Branches are merged into develop, which, after testing, is merged into master and pushed to production.
The source code on master should always be production-ready.

