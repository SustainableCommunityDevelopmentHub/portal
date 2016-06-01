# Base python 3.4 and apache build, inspired by
# https://github.com/micktwomey/docker-python3.4/blob/master/Dockerfile
FROM ubuntu:14.04
MAINTAINER Adam Cahan, acahan@getty.edu

#Suppress inaccurate errs when building image from Dockerfile
ARG TERM=linux
ARG DEBIAN_FRONTEND=noninteractive

# What exactly is this doing???
RUN echo "deb http://ppa.launchpad.net/fkrull/deadsnakes/ubuntu trusty main" > /etc/apt/sources.list.d/deadsnakes.list \
&& apt-key adv --keyserver keyserver.ubuntu.com --recv-keys DB82666C

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
    python3.5 \
    python3.5-dev \
    ssh \
    vim \
    && apt-get autoremove \
    && apt-get clean


# Apache requires these
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

# lynx is required for `apache2ctl status`
RUN apt-get install -y lynx

# Apache virtual host file
RUN mkdir /var/www/portal
COPY portal.conf /etc/apache2/sites-available/portal.conf
RUN a2ensite portal

#OLD
#ADD https://raw.githubusercontent.com/pypa/pip/5d927de5cdc7c05b1afbdd78ae0d1b127c04d9d0/contrib/get-pip.py /root/get-pip.py
ADD https://bootstrap.pypa.io/get-pip.py /root/get-pip.py
RUN python3.5 /root/get-pip.py
RUN pip3.5 install -U "setuptools==18.4"
RUN pip3.5 install -U "pip==8.1.2"
RUN pip3.5 install -U "virtualenv==13.1.2"

# Django required modules
COPY requirements.txt /var/www/portal/requirements.txt

RUN cd /var/www/portal \
    virtualenv ENV \
    source ENV/bin/activate

RUN pip install requirements

EXPOSE 80

CMD ["/usr/sbin/apache2ctl", "-D", "FOREGROUND"]
