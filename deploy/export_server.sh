#!/bin/bash

SERVER_IP=10.64.16.120
KEYFILE=${KEYFILE:?"Need to set KEYFILE to point to keyfile to use with ssh / scp"}

docker save docker.uncharted.software/live_topic_modelling | gzip -c > live_topic_modelling_v1.tgz

scp -i $KEYFILE live_topic_modelling_v1.tgz centos@${SERVER_IP}:./live_topic_modelling
scp -i $KEYFILE import_server.sh centos@${SERVER_IP}:./live_topic_modelling
scp -i $KEYFILE start_server.sh centos@${SERVER_IP}:./live_topic_modelling
scp -i $KEYFILE create_network.sh centos@${SERVER_IP}:./live_topic_modelling 
