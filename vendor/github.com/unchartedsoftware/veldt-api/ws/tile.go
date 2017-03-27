package ws

import (
	"fmt"
	"net/http"

	"github.com/unchartedsoftware/plog"
	"github.com/unchartedsoftware/veldt"
	"github.com/unchartedsoftware/veldt/util/json"
)

const (
	// TileRoute represents the HTTP route for the resource.
	TileRoute = "/ws/tile"
)

// TileHandler represents the HTTP route response handler.
func TileHandler(w http.ResponseWriter, r *http.Request) {
	// create conn
	conn, err := NewConnection(w, r, handleTileRequest)
	if err != nil {
		log.Warn(err)
		return
	}
	// listen for requests and respond
	err = conn.ListenAndRespond()
	if err != nil {
		log.Info(err)
	}
	// clean up conn internals
	conn.Close()
}

func handleTileRequest(conn *Connection, msg []byte) {
	// parse the tile request into JSON
	req, err := parseRequestJSON(msg)
	if err != nil {
		// parsing error, send back a failure response
		err := fmt.Errorf("unable to parse tile request message: %s", string(msg))
		// log error
		log.Warn(err)
		// send error response
		err = handleErr(conn, err)
		if err != nil {
			log.Warn(err)
		}
		return
	}
	// get pipeline id
	pipeline, ok := json.GetString(req, "pipeline")
	if !ok {
		// send error response
		err := fmt.Errorf(`no "pipeline" argument is provided`)
		err = handleErr(conn, err)
		if err != nil {
			log.Warn(err)
		}
		return
	}
	// generate tile and wait on response
	err = veldt.GenerateTile(pipeline, req)
	if err != nil {
		log.Warn(err)
		req["success"] = false
		req["error"] = formatErr(err)
	} else {
		req["success"] = true
		req["error"] = nil
	}
	// send response
	err = conn.SendResponse(req)
	if err != nil {
		log.Warn(err)
	}
}
