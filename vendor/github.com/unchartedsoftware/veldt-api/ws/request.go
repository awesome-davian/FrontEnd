package ws

import (
	"encoding/json"
)

// parseRequestJSON parses the incoming request body as JSON.
func parseRequestJSON(bytes []byte) (map[string]interface{}, error) {
	var req map[string]interface{}
	err := json.Unmarshal(bytes, &req)
	if err != nil {
		return nil, err
	}
	return req, nil
}
