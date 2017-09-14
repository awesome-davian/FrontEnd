package remote 

import (
	// "encoding/binary"
	"encoding/json"
	"fmt"

	// "math/rand"
	// "time"

	// "github.com/unchartedsoftware/plog"
	"github.com/unchartedsoftware/veldt"
	"github.com/unchartedsoftware/veldt/binning"
	jsonUtil "github.com/unchartedsoftware/veldt/util/json"
	"github.com/unchartedsoftware/veldt/tile"
)

type WordGlyphTile struct {
	APITile
	date int64
	wordTerm string
	tile.Macro
}

func NewWordGlyphTile() veldt.TileCtor {
	return func() (veldt.Tile, error) {
		return &WordGlyphTile{}, nil
	}
}

func (t *WordGlyphTile) Parse(params map[string]interface{}) error {

	// log.Debug(params);

	word, ok := jsonUtil.GetString(params, "word")
	if !ok {
		return fmt.Errorf("`word` parameter missing from glyph tile")
	}

	// get time from
	date, ok := jsonUtil.GetNumber(params, "timeFrom")
	if !ok {
		return fmt.Errorf("`timeFrom` parameter missing from glyph tile")
	}
	

	t.date = int64(date)
	t.wordTerm = word

	// Use hash of all parameters to identify request.
	requestId := fmt.Sprintf("%v::%v",
		date, word)
		// timeFrom, timeTo)

	t.requestId = requestId
	t.tileType = "wordglyph"

	return t.Macro.Parse(params)
}

func (t *WordGlyphTile) GetApiUrl() string {
	// TODO: Have the URL configurable!
	return "http://163.152.20.64:5001/GET_WORDGLYPH/test"
}

func (t *WordGlyphTile) Create(uri string, coord *binning.TileCoord, query veldt.Query) ([]byte, error) {

	// Setup the tile coordinate information.
	t.x = coord.X
	t.y = coord.Y
	t.z = coord.Z

	// Send the request to the batching client and wait for the response.
	client := getServiceClient(t)
	resChan, err := client.AddRequest(t)
	if err != nil {
		return nil, err
	}

	res := <-resChan

	// Either an error, or the response from the remote service.
	err, ok := res.(error)
	if ok {
		return nil, err
	}

	// Encode the results. Extract all the topics and use the score for weighing.
	// Result is a string containing the JSON. Need to get to the topics.
	var tmpGlyphParsed interface{}
	err = json.Unmarshal([]byte(res.(string)), &tmpGlyphParsed)
	if err != nil {
		return nil, err
	}

	glyphParsed, ok := tmpGlyphParsed.(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("Unexpected response format from topic modelling service: incorrect structure in %v", res)
	}

	glyphData, ok := jsonUtil.GetChild(glyphParsed, "word_glyph")
	if !ok {
		return nil, fmt.Errorf("Unexpected response format from topic modelling service: cannot find 'word_glyph' in %v", res)
	}

	score, ok := jsonUtil.GetNumber(glyphData, "score")
	if !ok {
		return nil, fmt.Errorf("Unexpected response format from topic modelling service: cannot find 'score' in %v", res)
	}

	percent, ok := jsonUtil.GetNumber(glyphData, "percent")
	if !ok {
		return nil, fmt.Errorf("Unexpected response format from topic modelling service: cannot find 'percent' in %v", res)
	}

	temporal, ok := jsonUtil.GetArray(glyphData, "temporal")
	if !ok {
		return nil, fmt.Errorf("Unexpected response format from topic modelling service: cannot find 'temporal' in %v", res)
	}

	result := make(map[string]interface{})
	result["score"] = score
	result["percent"] = percent
	result["temporal"] = temporal

	return json.Marshal(result)
}

// Create the request to the remote service.
func (t *WordGlyphTile) GetRequestParameters() map[string]interface{} {
	parameters := make(map[string]interface{})

	parameters["date"] = t.date
	parameters["word"] = t.wordTerm
	// parameters["lod"] = t.lod

	return parameters
}

func (t *WordGlyphTile) GetTileId() string {
	return fmt.Sprintf("%v/%v/%v", t.z, t.x, t.y)
}

