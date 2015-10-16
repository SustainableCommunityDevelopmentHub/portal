Getty Research Portal
=====================
*******************************


Running the Application
------------------------

1. Make sure you have a docker virtual machine running. Use `docker-machine ls` to check the status of your docker machines. `docker-machine --help` will provide a handy list of all available commands.

2. *In your project directory,* start the portal container. You can use `docker ps` to see a list of all active containers, and `docker inspect <some-container>` for container configuration information. You may find it helpful to leave a tab open in the terminal just for working in the docker container.
        
        bash portal_launch.sh

3. *In the docker container,* login as user 'getty' (pw "getty321"), navigate to project directory, and start the development web server.

          login getty
          cd portal
          npm start

4. The application should now be running on port 8000. You can now edit code in the project file *on your host machine* with your editor of choice.

In your host, open your browser to (http://192.168.99.100:8000/app). Doublecheck that this is the correct IP address of your docker machine. You can do this by typing (in your host) `docker-machine ip <my-docker-machine-name>`. The default docker machine is named 'default', and the default IP address is as above.


Enter a search for "history" and click the Search button (click twice)

*******************************


Setup
_______________________

#Install Docker Toolbox

The recommended way to install Docker on OS X is using homebrew cask (or Macports) to install the docker toolbox.
If you don't have either one of these, go [here](http://http://brew.sh/) for homebrew install instructions and description.

Once you have homebrew, to install homebrew cask:
        brew update
        brew install caskroom

Then use it to install Docker Toolbox:
        brew cask install dockertoolbox

Finally....

1. Create an account on docker hub.

2. Start a docker machine:
        docker-machine start default


#Build and configure Docker Container for project
1. Pull docker image for the portal app.

        docker pull sley/portal:v2

2. On your host machine create a project directory.

        git clone https://github.com/gri-is/portal.git

3. *From your project directory, i.e. projects/portal* create and start the docker container. This will also mount your project directory as a data volume on the container. This will log you into to the docker container as root. On your host, you can see a list of all running docker containers with `docker ps`.

        bash portal_launch.sh

3. In the container, switch to user "getty", password "getty321".

        login getty

4. cd to portal project directory.

        cd portal

#Configuring elasticsearch in the docker container
5. Create the Portal index

    curl -XPUT localhost:9200/portal

Enable CORS for elasticsearch.

6. Open the elasticsearch config file

        sudo vim /etc/elasticsearch/elasticsearch.yml

7. Add the following lines to the bottom

        http.cors.enabled: true
        http.cors.allow-origin: "*"
        
8. Set elasticsearch to run as a service on startup
    
        sudo update-rc.d elasticsearch defaults 95 10

9. Start elasticsearch

        sudo /etc/init.d/elasticsearch start

10. Load the sample data

        curl -s -XPOST localhost:9200/_bulk --data-binary @sample_data/frick_batch; echo

#Build Node.js project

1. *In the docker container,* navigate to the project director

2. Run `npm install` to install node modules. If the operation fails and you see errors, check the version of virtualbox *on the host machine* with `vboxmanage --version`. If it is version 5.0.4, upgrade to 5.0.6 or later. You should be able to do this with `brew cask install virtualbox`. Otherwise go to the Oracle virtualbox website and download the latest version.













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

