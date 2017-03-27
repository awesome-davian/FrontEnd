package http

import (
	"encoding/json"
	"io"
)

// parseRequestJSON parses the incoming request body as JSON.
func parseRequestJSON(body io.ReadCloser) (map[string]interface{}, error) {
	// parse params map
	decoder := json.NewDecoder(body)
	var args map[string]interface{}
	err := decoder.Decode(&args)
	if err != nil {
		return nil, err
	}
	return args, nil
}
