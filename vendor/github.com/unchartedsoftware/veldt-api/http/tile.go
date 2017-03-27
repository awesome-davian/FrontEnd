package http

import (
	"fmt"
	"net/http"

	"github.com/unchartedsoftware/plog"
	"github.com/unchartedsoftware/veldt"
	"github.com/unchartedsoftware/veldt/util/json"
)

const (
	// TileRoute represents the HTTP route for the resource.
	TileRoute = "/tile"
)

// TileHandler represents the HTTP route response handler.
func TileHandler(w http.ResponseWriter, r *http.Request) {
	// set content type response header
	w.Header().Set("Content-Type", "application/json")
	// parse tile req from URL and body
	req, err := parseRequestJSON(r.Body)
	if err != nil {
		log.Warn(err)
		handleErr(w, err)
		return
	}
	// get pipeline id
	pipeline, ok := json.GetString(req, "pipeline")
	if !ok {
		// send error response
		err := fmt.Errorf(`no "pipeline" argument is provided`)
		log.Warn(err)
		handleErr(w, err)
		return
	}
	// ensure it's generated
	err = veldt.GenerateTile(pipeline, req)
	if err != nil {
		log.Warn(err)
		handleErr(w, err)
		return
	}
	// get tile data from store
	tile, err := veldt.GetTileFromStore(pipeline, req)
	if err != nil {
		log.Warn(err)
		handleErr(w, err)
		return
	}
	// send response
	w.WriteHeader(200)
	w.Write(tile)
}
