# Base python 3.5 and apache build, inspired by
# https://github.com/micktwomey/docker-python3.4/blob/master/Dockerfile
FROM ubuntu:16.04
MAINTAINER Josh Gomez, jgomez@getty.edu

CMD set -e

# Suppress inaccurate errs when building image
ARG TERM=linux
ARG DEBIAN_FRONTEND=noninteractive

# Keep for posterity
#RUN echo "deb http://ppa.launchpad.net/fkrull/deadsnakes/ubuntu trusty main" > /etc/apt/sources.list.d/deadsnakes.list \
#&& apt-key adv --keyserver keyserver.ubuntu.com --recv-keys DB82666C

RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y \
    build-essential \
    ca-certificates \
    gcc \
    git \
    libpq-dev \
    make \
    mercurial \
    pkg-config \
    python3 \
    python3-dev \
    ssh \
    vim \
    net-tools \
    iputils-ping \
    curl \
    && apt-get autoremove \
    && apt-get clean


# Apache fails if these vars are not set.
ENV APACHE_RUN_USER www-data
ENV APACHE_RUN_GROUP www-data
ENV APACHE_LOG_DIR /var/log/apache2
ENV APACHE_PID_FILE /var/run/apache2.pid
ENV APACHE_RUN_DIR /var/run/apache2
ENV APACHE_LOCK_DIR /var/lock/apache2
RUN mkdir -p $APACHE_RUN_DIR $APACHE_LOCK_DIR $APACHE_LOG_DIR

RUN apt-get install -y apache2 \
    &&  apt-get clean
RUN apt-get install -y libapache2-mod-wsgi-py3 \
    &&  apt-get clean

# lynx is required for `apache2ctl status` to work
RUN apt-get install -y lynx

# Directory for apache to serve app from
RUN mkdir /var/www/portal

# Disable default apache config which conflicts with portal on port 80
RUN a2dissite 000-default

# Enable apache virtual host file and mod_wsgi config stuff
# These files tell apache to serve up application in correct manner for a single-page-app
# and where to find correction version of python, python modules, etc,
# for wsgi to work with Django.
COPY portal.conf /etc/apache2/sites-available/portal.conf
RUN a2ensite portal


#NOTE: need to find where equivalent of mod_wsgi.so-3.5 is located ...
#....could this have to do with installing mod-wsgi-py3 here when josh had mod-wsgi?
COPY wsgi.load /etc/apache2/mods-available/wsgi.load

# Install pip
ADD https://bootstrap.pypa.io/get-pip.py /root/get-pip.py
RUN python3 /root/get-pip.py
RUN pip3 install -U "setuptools==18.4"
RUN pip3 install -U "pip==8.1.2"



# Create python virtual environment for Django app
RUN cd /var/www/portal \
    pyvenv-3.5 ENV \
    source ENV/bin/activate

# Install Django requirements
COPY requirements.txt /var/www/portal/requirements.txt
RUN pip install requirements

EXPOSE 80

CMD ["/usr/sbin/apache2ctl", "-D", "FOREGROUND" ]
