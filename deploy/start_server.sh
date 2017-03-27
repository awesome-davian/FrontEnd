#!/bin/bash

# run in user network if created, otherwise run in the default network
if $(docker network ls | grep -q live_topic_modelling_nw); then
    docker run --net=live_topic_modelling_nw --rm --name live_topic_modelling -p 9090:8080 \
        docker.uncharted.software/live_topic_modelling:1.0
else
    docker run --rm --name live_topic_modelling -p 9090:8080 \
        docker.uncharted.software/live_topic_modelling:1.0
fi
