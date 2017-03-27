package ws

import (
	"github.com/unchartedsoftware/veldt-api/util"
)

func formatErr(err error) string {
	return util.FormatErr(err)
}

func handleErr(conn *Connection, err error) error {
	// send error response
	return conn.SendResponse(map[string]interface{}{
		"success": false,
		"error":   formatErr(err),
	})
}
