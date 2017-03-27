package http

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/unchartedsoftware/plog"

	"github.com/unchartedsoftware/veldt-api/util"
)

func handleErr(w http.ResponseWriter, err error) {
	// write error header
	w.WriteHeader(500)
	// error string
	bytes, err := json.Marshal(map[string]interface{}{
		"success": false,
		"error":   util.FormatErr(err),
	})
	if err != nil {
		log.Warn(err)
		return
	}
	// write error
	fmt.Fprint(w, string(bytes))
}
