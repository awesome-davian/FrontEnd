#!/bin/bash

SERVER_IP=10.64.16.120
KEYFILE=${KEYFILE:?"Need to set KEYFILE to point to keyfile to use with ssh / scp"}

docker save docker.uncharted.software/live_topic_modelling_redis | gzip -c > live_topic_modelling_redis_v1.tgz

scp -i $KEYFILE live_topic_modelling_redis_v1.tgz centos@${SERVER_IP}:./live_topic_modelling
scp -i $KEYFILE import_redis.sh centos@${SERVER_IP}:./live_topic_modelling
scp -i $KEYFILE start_redis.sh centos@${SERVER_IP}:./live_topic_modelling
