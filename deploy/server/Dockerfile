# Set the base image to alpine
FROM alpine

RUN apk add --no-cache ca-certificates

# Copy the server build files to the container's workspace
ADD ./server.bin /go/src/github.com/gtra-uncharted-collab/topic-visualization/server.bin
ADD ./public /go/src/github.com/gtra-uncharted-collab/topic-visualization/public

# Run the server by default when the container starts
ENTRYPOINT /go/src/github.com/gtra-uncharted-collab/topic-visualization/server.bin

# Document that the service listens on port 8080
EXPOSE 8080

ENV REDIS_HOST live_topic_modelling_redis
ENV REDIS_PORT 6379
ENV ES_HOST http://10.64.16.120
ENV ES_PORT 9200
ENV PUBLIC_DIR /go/src/github.com/gtra-uncharted-collab/topic-visualization/public
