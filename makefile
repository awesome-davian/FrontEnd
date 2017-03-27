version=0.1.0

.PHONY: all

all:
	@echo "make <cmd>"
	@echo ""
	@echo "commands:"
	@echo "  build         - build the source code"
	@echo "  deploy        - build and copy the dist binary for dockerization"
	@echo "  lint          - lint the source code"
	@echo "  test          - test the source code"
	@echo "  fmt           - format the code with gofmt"
	@echo "  install       - install dependencies"

clean:
		@rm -rf ./build

lint:
	@go vet $(shell glide novendor)
	@go list ./... | grep -v /vendor/ | xargs -L1 golint

test:
	@go test $(shell glide novendor)

fmt:
	@go fmt $(NOVENDOR)
	@./node_modules/.bin/jsfmt -w ./public/scripts ./public/*.js

build: clean lint
	@go build -o ./build/server.bin ./main.go

deploy: clean lint
	@GOARCH=amd64 GOOS=linux CGO_ENABLED=0 go build -o ./build/server.bin ./main.go
	@cp -r ./build/server.bin ./deploy/server
	@gulp build
	@cp -r ./build/public ./deploy/server

install:
	@go get github.com/golang/lint/golint
	@go get github.com/Masterminds/glide
	@glide install
