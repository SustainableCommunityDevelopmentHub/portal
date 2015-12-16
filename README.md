Getty Research Portal
=====================
*******************************


Running the Application
------------------------


1. Make sure you have a docker virtual machine running. Use `docker-machine ls` to check the status of your docker machines. `docker-machine --help` will provide a handy list of all available commands.

2. *In your project directory,* start the portal container. You can use `docker ps` to see a list of all active containers, and `docker inspect <some-container>` for container configuration information. You may find it helpful to leave a tab open in the terminal just for working in the docker container.

        bash scripts/start-portal.sh

3. Open the elasticsearch config file with your editor of choice (the commands below are for vim)

        sudo vim /etc/elasticsearch/elasticsearch.yml

4. Add the following lines to the bottom of the file if they do not exist. 

        http.cors.enabled: true
        http.cors.allow-origin: "*"
        
5. If there are any other `http.cors` lines at the bottom of the file, delete them.
 
6. *In the docker container,* login as user 'getty' (pw "getty321"), navigate to project directory, and start the development web server.

          login getty
          cd portal
          npm start

If ES is already intialized, you can just run `npm start`, which will also launch ES.

5. The application should now be running on port 8000. You can now edit code in the project file *on your host machine* with your editor of choice.

In your host, open your browser to (http://local.portal.dev:8000), or, if you have not updated your `etc/hosts` file, (http://192.168.99.100:8000). Doublecheck that this is the correct IP address of your docker machine. You can do this by typing (in your host) `docker-machine ip <my-docker-machine-name>`. The default docker machine is named 'default', and the default IP address is as above.


Enter a search for "history" and click the Search button (click twice)

*******************************


Setup (OS X)
_______________________

#Install node.js
1. Make sure Xcode is installed on your machine. `xcode-select -p` should list the directory where Xcode is located, if it is installed. Running `gcc` will also throw an error if Xcode is not installed.
2. Install node.js: https://nodejs.org/en/ -- suggested version is v4.x (most recent version 4).

#Install Docker Toolbox and Docker
The recommended way to install Docker on OS X is using homebrew cask (or Macports) to install the docker toolbox.
If you don't have either one of these, go [here](http://http://brew.sh/) for homebrew install instructions and description.

Once you have homebrew, to install homebrew cask:
        brew update
        brew install caskroom

Then use it to install Docker Toolbox:
        brew cask install dockertoolbox

#Setup Docker Machine and hostname for project

1. Create an account on docker hub.
2. Create the default docker machine:
        `docker-machine create`

3. Start a docker machine:
        `docker-machine start default`

You can now run `docker run hello-world` to test that docker is working correctly inside your docker machine.

4. Run `docker-machine env default`. You will see instructions on how to create environment variable for you docker machine. Follow the instructions, and then also add the `EXPORT` commands into you .bash_profile so the environment variables will be set automatically in the future.

5. Add the following line to your /etc/hosts file:
       `<ip-address-of-my-docker-machine>    local.portal.dev`

You can run `docker-machine ip default` to find the IP address of your docker machine.


#Build and configure Docker Container for project
1. Pull docker image for the portal app.

        docker pull sley/portal:v2

2. On your host machine clone the portal repo.

        git clone https://github.com/gri-is/portal.git

3. *From your project directory, i.e. myprojects/portal* create and start the docker container. This will also mount your project directory as a data volume on the container. This will log you into to the docker container as root. On your host, you can see a list of all running docker containers with `docker ps`.

#Build Node.js project

1. *In the host environment,* navigate to the project directory

2. Run `npm install` to install node modules. If the operation fails and you see errors, check the version of virtualbox *on the host machine* with `vboxmanage --version`. If it is version 5.0.4, upgrade to 5.0.6 or later. You should be able to do this with `brew cask install virtualbox`. Otherwise go to the Oracle virtualbox website and download the latest version.

3. Run `bower install`
4. You should now be able to run the application! Follow the instructions at the beginning of this README to do so.

#Troubleshooting

- Is Elasticsearch running in the docker container? *In the docker container,* run `ps aux | grep elastic` - if elasticsearch is running you should see something like "/usr/bin/java -Xms256m -Xmx1g -Xss256k -Djava.awt.headless=true" etc and so forth...
