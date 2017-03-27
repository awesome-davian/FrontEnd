# veldt-api

[![Godoc](http://img.shields.io/badge/godoc-reference-blue.svg?style=flat)](http://godoc.org/github.com/unchartedsoftware/veldt-api)
[![Build Status](https://travis-ci.org/unchartedsoftware/veldt-api.svg?branch=master)](https://travis-ci.org/unchartedsoftware/veldt-api)
[![Go Report Card](https://goreportcard.com/badge/github.com/unchartedsoftware/veldt-api)](https://goreportcard.com/report/github.com/unchartedsoftware/veldt-api)

## Dependencies

Requires the [Go](https://golang.org/) programming language binaries with the `GOPATH` environment variable specified and `$GOPATH/bin` in your `PATH`.

## Installation

### Using `go get`:

If your project does not use the vendoring tool [Glide](https://glide.sh) to manage dependencies, you can install this package like you would any other:

```bash
go get github.com/unchartedsoftware/veldt-api
```

While this is the simplest way to install the package, due to how `go get` resolves transitive dependencies it may result in version incompatibilities.

### Using `glide get`:

This is the recommended way to install the package and ensures all transitive dependencies are resolved to their compatible versions.

```bash
glide get github.com/unchartedsoftware/veldt-api
```

NOTE: Requires [Glide](https://glide.sh) along with [Go](https://golang.org/) version 1.6+.

## Development

Clone the repository:

```bash
mkdir $GOPATH/src/github.com/unchartedsoftware
cd $GOPATH/src/github.com/unchartedsoftware
git clone git@github.com:unchartedsoftware/veldt-api.git
```

Install dependencies

```bash
cd veldt-api
make install
```

## Usage

This package provides HTTP and WebSocket handlers to connect the on-demand tile-based analytics of [veldt](https://github.com/unchartedsoftware/veldt/) to  HTTP and WebSocket endpoints.

## Example

```go
package main

import (
	"github.com/zenazn/goji"
	"github.com/unchartedsoftware/veldt-api/http"
	"github.com/unchartedsoftware/veldt-api/middleware"
	"github.com/unchartedsoftware/veldt-api/ws"
)

func main() {

	// Mount logger middleware
	goji.Use(middleware.Log)
	// Mount gzip middleware
	goji.Use(middleware.Gzip)

	// Meta websocket handler
	log.Infof("Meta WebSocket route: '%s'", ws.MetaRoute)
	goji.Get(ws.MetaRoute, ws.MetaHandler)

	// Tile websocket handler
	log.Infof("Tile WebSocket route: '%s'", ws.TileRoute)
	goji.Get(ws.TileRoute, ws.TileHandler)

	// Meta request handler
	log.Infof("Meta HTTP route: '%s'", http.MetaRoute)
	goji.Post(http.MetaRoute, http.MetaHandler)
	// Tile request handler
	log.Infof("Tile HTTP route: '%s'", http.TileRoute)
	goji.Post(http.TileRoute, http.TileHandler)

	// Start the server
	goji.Serve()
}
```
