# Plog

[![Godoc](http://img.shields.io/badge/godoc-reference-blue.svg?style=flat)](http://godoc.org/github.com/unchartedsoftware/plog)
[![Build Status](https://travis-ci.org/unchartedsoftware/plog.svg?branch=master)](https://travis-ci.org/unchartedsoftware/plog)
[![Go Report Card](https://goreportcard.com/badge/github.com/unchartedsoftware/plog)](https://goreportcard.com/report/github.com/unchartedsoftware/plog)

> A pretty logger for Go

## Dependencies

Requires the [Go](https://golang.org/) programming language binaries with the `GOPATH` environment variable specified and `$GOPATH/bin` in your `PATH`.

## Installation

##### Using `go get`:

If your project does not use the vendoring tool [Glide](https://glide.sh) to manage dependencies, you can install this package like you would any other:

```bash
go get github.com/unchartedsoftware/plog
```

While this is the simplest way to install the package, due to how `go get` resolves transitive dependencies it may result in version incompatibilities.

##### Using `glide get`:

This is the recommended way to install the package and ensures all transitive dependencies are resolved to their compatible versions.

```bash
glide get github.com/unchartedsoftware/plog
```

NOTE: Requires [Glide](https://glide.sh) along with [Go](https://golang.org/) version 1.6+.

## Example

```go
package main

import (
	"github.com/unchartedsoftware/plog"
)

func main() {
	log.Debug("This is a debug level log")
	log.Info("This", "is", "an", "info", "level", "log")
	log.Warnf("This is a %s level log", "warn")
	log.Error("This is an error level log")

	// only log warnings and errors
	log.SetLevel(log.WarnLevel)

	log.Debug("This is a debug level log, I will be ignored")
	log.Info("This is an info level log, I will be ignored too")
	log.Warn("This is a warn level log, you will see me")
	log.Error("This is an error level log, you will see me too")
}
```
