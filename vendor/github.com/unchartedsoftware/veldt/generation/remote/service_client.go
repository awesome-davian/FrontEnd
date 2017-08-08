package remote

import (
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/parnurzeal/gorequest"
	"github.com/unchartedsoftware/plog"
)

const (
	batchWaitTime = 500
)

var (
	mutex    = sync.Mutex{} //May want to create a mutex / client.
	handlers = make(map[string]*ServiceClient)
)

// Create the hash for the tile.
func getTileCoordinateHash(x, y, z uint32) string {
	return fmt.Sprintf("%v/%v/%v", z, x, y)
}

type APIRequest interface {
	GetApiUrl() string
	GetRequestId() string
	GetRequestParameters() map[string]interface{}
	GetTileCoordinateHash() string
	GetTileCoordinate() map[string]uint32
	GetTileType() string
}

type APITile struct {
	requestId string
	tileType  string
	x         uint32
	y         uint32
	z         uint32
}

func (t *APITile) GetRequestId() string {
	return fmt.Sprintf("%s:%s", t.tileType, t.requestId)
}

func (t *APITile) GetTileType() string {
	return t.tileType
}

// Create the hash for the tile.
func (t *APITile) GetTileCoordinateHash() string {
	return getTileCoordinateHash(t.x, t.y, t.z)
}

// Create the hash for the tile.
func (t *APITile) GetTileCoordinate() map[string]uint32 {
	coordinates := make(map[string]uint32)

	coordinates["x"] = t.x
	coordinates["y"] = t.y
	coordinates["level"] = t.z

	return coordinates
}

// A service client exists to handle a batch of tile requests.
func getServiceClient(tile APIRequest) *ServiceClient {
	requestId := tile.GetRequestId()

	// Not the most efficient use of locks. Will probably need to be optimized.
	mutex.Lock()
	defer mutex.Unlock()
	if client, ok := handlers[requestId]; ok {
		return client
	}

	client := NewServiceClient()
	client.requestId = requestId
	client.apiURL = tile.GetApiUrl()
	handlers[requestId] = client

	go client.HandleRequests()

	return client
}

// Handles a batch of topic tile requests.
type ServiceClient struct {
	requestId        string
	requests         []APIRequest
	responseChannels map[string]chan interface{}
	apiURL           string
	processing       bool
}

// Create the new service client. Only initializes the response channels
// since we do not know how many topic tiles are expected yet.
func NewServiceClient() *ServiceClient {
	service := ServiceClient{}
	service.requests = make([]APIRequest, 0)
	service.responseChannels = make(map[string]chan interface{})
	service.processing = false

	return &service
}

// Add a request to the batch.
func (c *ServiceClient) AddRequest(tile APIRequest) (chan interface{}, error) {
	// Get duplicate requests to return the same channel that is already setup.
	// TODO: Need to actually handle the duplcate request case because right now Only
	// a single message gets written to the channel.
	hash := tile.GetTileCoordinateHash()
	mutex.Lock()
	defer mutex.Unlock()
	if channel, ok := c.responseChannels[hash]; ok {
		return channel, nil
	}

	if c.processing {
		return nil, fmt.Errorf("Cannot add tile to request. Service is already processing.")
	}

	// Create the response channel.
	channel := make(chan interface{})
	c.responseChannels[hash] = channel

	c.requests = append(c.requests, tile)

	return channel, nil
}

// Main function to be called on initialization in a separate thread.
func (c *ServiceClient) HandleRequests() {
	// Batch the requests.
	c.waitForRequests()

	// About to process batched requests. Remove this handler to allow for another batch.
	mutex.Lock()
	c.processing = true
	delete(handlers, c.requestId)
	mutex.Unlock()

	// Read the requests data.
	requests := c.getClientRequestsData()

	// Send the request to the server.
	response, err := c.sendRequest(requests)
	if err != nil {
		c.handleError(err)
		return
	}

	// Parse the response from the server.
	parsedResponse, err := c.parseResponse([]byte(response))
	if err != nil {
		c.handleError(err)
		return
	}

	// log.Print(parsedResponse);

	// Write the topics back to the tile handlers.
	// May be a bit abusive of the mutex.
	mutex.Lock()
	for hash, topics := range parsedResponse {
		tileChannel := c.responseChannels[hash]
		tileChannel <- topics
		// Remove the handler.
		delete(c.responseChannels, hash)
	}
	mutex.Unlock()

	// Could have a check to make sure c.responseChannels is empty.
}

func (c *ServiceClient) sendRequest(requestData map[string]interface{}) (string, error) {
	// TODO: Have the URL configurable!
	request := gorequest.New()
	_, result, errs := request.Post(c.apiURL).Send(requestData).End()

	// TODO: Check the return values (the response) to make sure it is 200.
	// For now return the first error.
	if errs != nil && len(errs) > 0 {
		return "", errs[0]
	}

	return result, nil
	//return c.fakeResponse(requestData)
}

func (c *ServiceClient) fakeResponse(requestData map[string]interface{}) (string, error) {
	result := ""
	for _, tile := range requestData["tiles"].([]interface{}) {
		tileData := tile.(map[string]uint32)

		log.Debug(c.requests[0].GetTileType())

		if c.requests[0].GetTileType() == "topic" {
			result = fmt.Sprintf(`%v, {
				"tile": {"x": %v, "y": %v, "level": %v},
				"topic": [{
					"score": 0.16331,
					"exclusiveness": 0,
					"words": [
						{"word": "nyc", "count": 330, "score": 0.19698},
						{"word": "marathon", "count": 442, "score": 0.023675}, 
						{"word": "edbanger", "count": 0, "score": 0.01824}, 
						{"word": "park", "count": 134, "score": 0.013334}
					]
				}, {
					"score": 0.15949, 
					"exclusiveness": 0, 
					"words": [
						{"word": "marathon", "count": 442, "score": 0.1367},
						{"word": "ing", "count": 144, "score": 0.056605}, 
						{"word": "finish", "count": 33, "score": 0.054968}, 
						{"word": "city", "count": 195, "score": 0.040207}
					]
				}, {
					"score": 0.10825, 
					"exclusiveness": 0, 
					"words": [
						{"word": "love", "count": 642, "score": 0.24868}, 
						{"word": "live", "count": 141, "score": 0.011044},
						{"word": "matter", "count": 22, "score": 0.0094907}, 
						{"word": "hdsc", "count": 0, "score": 0.0090076}
					]
				}, {
					"score": 0.087243, 
					"exclusiveness": 0, 
					"words": [
						{"word": "night", "count": 313, "score": 0.19153}, 
						{"word": "saturday", "count": 34, "score": 0.017975}, 
						{"word": "party", "count": 109, "score": 0.012218}, 
						{"word": "live", "count": 141, "score": 0.010251}
					]
				}]
				}
				`, result, tileData["x"], tileData["y"], tileData["level"])
		} else if c.requests[0].GetTileType() == "hitmap" {
			result = fmt.Sprintf(`%v, {
				"tile": {"x": %v, "y": %v, "level": %v},
				"exclusiveness_score": [
					{"value": %v, "date": "03-11-2013"}
				]
				}`, result, tileData["x"], tileData["y"], tileData["level"],
				float64((tileData["x"]+tileData["y"]))/float64(tileData["level"]))
		} else if c.requests[0].GetTileType() == "geopoint" {
			result = fmt.Sprintf(`%v, {
				"tile": {"x": %v, "y": %v, "level": %v}}`, result, tileData["x"], tileData["y"], tileData["level"])
		} else if c.requests[0].GetTileType() == "wordglyph" {
			result = fmt.Sprintf(`%v, {
				"tile": {"x": %v, "y": %v, "level": %v}, 
				"wordglyph": [
					{"word": "marathon", "count": 442}
				]}`, result, tileData["x"], tileData["y"], tileData["level"])
		} else if c.requests[0].GetTileType() == "tileglyph" {
			result = fmt.Sprintf(`%v, {
				"tile": {"x": %v, "y": %v, "level": %v}, 
				"tileglyph": [
					{"count": 442}
				]}`, result, tileData["x"], tileData["y"], tileData["level"])
		} else {
			result = fmt.Sprintf(`%v, {
				"tile": {"x": %v, "y": %v, "level": %v}}`, result, tileData["x"], tileData["y"], tileData["level"])
		}
	}

	result = fmt.Sprintf("[%s]", result[1:])
	// fmt.Printf("Result: %s", result)
	log.Debug(result)

	return result, nil
}

// Handle errors raised during the processing of the batch.
func (c *ServiceClient) handleError(err error) {
	// Send the error to all tiles.
	for _, tile := range c.responseChannels {
		tile <- err
	}
}

// Create the request to the remote service.
func (c *ServiceClient) getClientRequestsData() map[string]interface{} {
	initialRequest := c.requests[0]

	// This code may be better off in the tile.
	// All tiles have the same parameters except for tile coordinates.
	parameters := initialRequest.GetRequestParameters()

	// Get the tile coordinates.
	coordinates := make([]interface{}, len(c.requests))
	for i, t := range c.requests {
		coordinates[i] = t.GetTileCoordinate()
	}

	tileData := make(map[string]interface{})
	tileData["parameters"] = parameters
	tileData["tiles"] = coordinates

	return tileData
}

// Parse the response from the remote service.
func (c *ServiceClient) parseResponse(response []byte) (map[string]string, error) {
	// Unmarshall the json and go through the expected structure.
	var raw interface{}
	err := json.Unmarshal([]byte(response), &raw)
	if err != nil {
		fmt.Printf("Error parsing JSON!")
		return nil, err
	}

	tiles, ok := raw.([]interface{})
	if !ok {
		return nil, fmt.Errorf("Unable to parse response from Topic Modelling service.")
	}

	// Extract the information by tile.
	parsed := make(map[string]string)
	for _, t := range tiles {
		// Pull the coordinate information to build the tile hash.
		tileData, ok := t.(map[string]interface{})
		if !ok {
			return nil, fmt.Errorf("Unable to parse response from Topic Modelling service.")
		}

		tileCoord, ok := tileData["tile"].(map[string]interface{})
		if !ok {
			return nil, fmt.Errorf("Unable to parse response from Topic Modelling service.")
		}

		// Create the json for the tile response.
		tileString, err := json.Marshal(tileData)
		if err != nil {
			return nil, err
		}

		x := uint32(tileCoord["x"].(float64))
		y := uint32(tileCoord["y"].(float64))
		z := uint32(tileCoord["level"].(float64))
		parsed[getTileCoordinateHash(x, y, z)] = string(tileString)
	}

	return parsed, nil
}

// Wait for 500 ms to batch requests to the server.
func (c *ServiceClient) waitForRequests() {
	time.Sleep(batchWaitTime * time.Millisecond)
}
