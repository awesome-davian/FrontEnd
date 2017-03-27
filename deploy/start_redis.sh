#!/bin/bash

# run in isolated app network if created, otherwise run in the default network, and map
# the port so that local services get access
if $(docker network ls | grep -q live_topic_modelling_nw); then
    docker run --rm --name live_topic_modelling_redis --net=live_topic_modelling_nw \
        docker.uncharted.software/live_topic_modelling_redis:1.0
else
    docker run --rm --name live_topic_modelling_redis -p 6379:6379 \
        docker.uncharted.software/live_topic_modelling_redis:1.0
fi
