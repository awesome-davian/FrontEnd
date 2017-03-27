package api

import (
	h "net/http"
	"os"

	"github.com/unchartedsoftware/plog"
	"github.com/unchartedsoftware/veldt-api/http"
	"github.com/unchartedsoftware/veldt-api/middleware"
	"github.com/unchartedsoftware/veldt-api/ws"
	"github.com/zenazn/goji/web"
)

const (
	defaultPublicDir = "./build/public"
)

// New returns a new Goji Mux handler to process HTTP requests.
func New() h.Handler {
	r := web.New()

	// mount logger middleware
	r.Use(middleware.Log)
	// mount gzip middleware
	r.Use(middleware.Gzip)

	// meta websocket handler
	log.Infof("Meta WebSocket route: '%s'", ws.MetaRoute)
	r.Get(ws.MetaRoute, ws.MetaHandler)

	// tile websocket handler
	log.Infof("Tile WebSocket route: '%s'", ws.TileRoute)
	r.Get(ws.TileRoute, ws.TileHandler)

	// metadata request handler
	log.Infof("Meta HTTP route: '%s'", http.MetaRoute)
	r.Post(http.MetaRoute, http.MetaHandler)
	// tile request handler
	log.Infof("Tile HTTP route: '%s'", http.TileRoute)
	r.Post(http.TileRoute, http.TileHandler)

	// add greedy route last
	publicDir := os.Getenv("PUBLIC_DIR")
	if publicDir == "" {
		publicDir = defaultPublicDir
	}
	log.Infof("Public dir: '%s'", publicDir)
	r.Get("/*", h.FileServer(h.Dir(publicDir)))

	return r
}
