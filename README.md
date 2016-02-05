Getty Research Portal
=====================
*******************************


Running the Application
------------------------


1. Make sure you have a docker virtual machine running. Use `docker-machine ls` to check the status of your docker machines. `docker-machine --help` will provide a handy list of all available commands.

2. *In your project directory,* start the portal containers  with `docker-compose up` Also, you can use `docker ps` to see a list of all active containers, and `docker inspect <some-container>` for container configuration information. You may find it helpful to leave a tab open in the terminal just for working in the docker container.

3.  If you are running the application for the first time, you must run `bash init-es.sh` to create an elasticsearch index and upload sample data. Subsequently this should not be necessary.

4. The application should now be running on port 8000. You can now edit code in the project file *on your host machine* with your editor of choice.

In your host, open your browser to (http://local.portal.dev:8000), or, if you have not updated your `etc/hosts` file, (http://192.168.99.100:8000). Doublecheck that this is the correct IP address of your docker machine. You can do this by typing (in your host) `docker-machine ip <my-docker-machine-name>`. The default docker machine is named 'default', and the default IP address is as above.


Enter a search for "history" and click the Search button.

*******************************


#Setup (OS X)

1. Make sure Xcode Command Line Tools is installed on your machine. `xcode-select -p` should list the directory where Xcode is located, if it is installed. Running `gcc` will also throw an error if Xcode Command Line Tools is not installed. To simply install the developer tools, enter `xcode-select --install` in the command line and follow instructions. You can also install Xcode (which includes Command Line Tools) through the App store. A walkthrough for installation is
   [here](http://railsapps.github.io/xcode-command-line-tools.html)

# (Optional, Recommended for Developers) Install node.js
1. Install node.js: https://nodejs.org/en/ -- suggested version is v4.x (most recent version 4).
2. Install the following helper node modules globally: [bower](http://bower.io/),  [karma-cli](https://www.npmjs.com/package/karma-cli)  **(do not install karma globally)**, [grunt](https://www.npmjs.com/package/grunt]), [npm-check-updates](https://www.npmjs.com/package/npm-check-updates), [dedupe](https://docs.npmjs.com/cli/dedupe), and [jshint](http://jshint.com/install/):
 ````
npm install -g bower karma grunt-cli npm-check-updates dedupe jshint
````

#Clone this Repo
In the directory where you want your project to live, enter `git clone <my-repo-clone-url-goes-here>`. The clone URL for this repo can be found near the top of this web-page where it says HTTPS. For developers it is recommended to use SSH and set up your SSH key. If you're not sure what to use, use the HTTPS url.

#Install Docker Toolbox and Docker
The recommended way to install Docker on OS X is using homebrew cask (or Macports) to install the docker toolbox. If you don't want to use a package manager, [OS X install instructions for Docker Toolbox can be found here](https://www.docker.com/docker-toolbox).
If you don't have either one of these, go [here](http://http://brew.sh/) for homebrew install instructions and description.

Once you have homebrew, update it to most recent:
        `brew update`

Then use it to install Docker Toolbox:
        `brew cask install dockertoolbox`

#Setup Docker Machine

1. Create an account on docker hub.
2. Create a basic docker machine named "default" using the virtualbox driver:
        `docker-machine create --driver virtualbox default`

3. Start the default docker machine:
        `docker-machine start default`

4. Run `docker-machine env default`. You will see instructions on how to create environment variable for you docker machine.

5. Run the command `eval "$(docker-machine env default)"`

6. Add the `EXPORT` commands previously printed out into your `.bash_profile` so the environment variables will be set automatically in the future. If you don't have a `.bash_profile` file, `touch ~/.bash_profile` will create one.

7. You can now run `docker run hello-world` to test that docker is working correctly inside your docker machine.

#Set hostname
1. Add the following line to your /etc/hosts file:
       `<ip-address-of-my-docker-machine>    local.portal.dev`

You can run `docker-machine ip default` to find the IP address of the default docker machine. The default IP setting should be `192.168.99.100`.

#Troubleshooting

- Is Elasticsearch running in the docker container? *In the docker container,* run `ps aux | grep elastic` - if elasticsearch is running you should see something like "/usr/bin/java -Xms256m -Xmx1g -Xss256k -Djava.awt.headless=true" etc and so forth...
