FROM ubuntu:14.04
MAINTAINER Susan Ley
RUN apt-get -y install software-properties-common
RUN add-apt-repository ppa:webupd8team/java
RUN apt-get -y update
RUN echo "oracle-java8-installer shared/accepted-oracle-license-v1-1 boolean true" | debconf-set-selections
RUN apt-get -y install oracle-java8-installer
RUN apt-get install oracle-java8-set-default
RUN wget -qO - hwget -qO - https://packages.elasticsearch.org/GPG-KEY-elasticsearch | sudo apt-key add -
RUN add-apt-repository "deb http://packages.elasticsearch.org/elasticsearch/2.1/debian stable main"
RUN apt-get -y update && apt-get -y install elasticsearch
RUN update-rc.d elasticsearch defaults 95 10
RUN apt-get -y install nodejs
RUN apt-get -y install nodejs-legacy
RUN apt-get -y install curl
RUN apt-get -y install git
RUN apt-get -y install npm
RUN apt-get -y install vim
RUN mkdir portal
EXPOSE 9200
EXPOSE 8000
