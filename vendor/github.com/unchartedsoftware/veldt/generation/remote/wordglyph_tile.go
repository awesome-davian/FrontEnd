package remote 

import (
	// "encoding/binary"
	"encoding/json"
	"fmt"

	// "math/rand"
	// "time"

	"github.com/unchartedsoftware/plog"
	"github.com/unchartedsoftware/veldt"
	"github.com/unchartedsoftware/veldt/binning"
	jsonUtil "github.com/unchartedsoftware/veldt/util/json"
	"github.com/unchartedsoftware/veldt/tile"
)

type WordGlyphTile struct {
	APITile
	timeFrom int64
	timeTo   int64
	wordTerm string
	lod int
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
	timeFrom, ok := jsonUtil.GetNumber(params, "timeFrom")
	if !ok {
		return fmt.Errorf("`timeFrom` parameter missing from glyph tile")
	}
	// get time time
	timeTo, ok := jsonUtil.GetNumber(params, "timeTo")
	if !ok {
		return fmt.Errorf("`timeTo` parameter missing from glyph tile")
	}

	t.timeFrom = int64(timeFrom)
	t.timeTo = int64(timeTo)
	t.wordTerm = word

	// Use hash of all parameters to identify request.
	requestId := fmt.Sprintf("%v::%v::%v",
		timeFrom, timeTo, word)
		// timeFrom, timeTo)

	t.requestId = requestId
	t.tileType = "wordglyph"

	return t.Macro.Parse(params)
}

func (t *WordGlyphTile) GetApiUrl() string {
	// TODO: Have the URL configurable!
	return "http://163.152.20.64:5001/GET_WORD_GLYPH/test"
}

func (t *WordGlyphTile) Create(uri string, coord *binning.TileCoord, query veldt.Query) ([]byte, error) {

	// log.Debug("WordGlyphTile.Create");

	// panic("WordGlyphTile.Create");

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

	result := make(map[uint32]map[string]interface{})
	glyphs, ok := jsonUtil.GetArray(glyphParsed, "wordglyph")
	if !ok {
		return nil, fmt.Errorf("Unexpected response format from topic modelling service: could not parse topics from %v", res)
	}

	glyphGroup := uint32(0)
	for _, glyph := range glyphs {

		item, ok := glyph.(map[string]interface{})
		if !ok {
			return nil, fmt.Errorf("Unexpected response format from topic modelling service: incorrect glyph structure in %v", res)
		}

		word, ok := jsonUtil.GetString(item, "word")
		if !ok {
			return nil, fmt.Errorf("Unexpected response format from topic modelling service: cannot find 'word' in %v", res)
		}

		count, ok := jsonUtil.GetNumber(item, "count")
		if !ok {
			return nil, fmt.Errorf("Unexpected response format from topic modelling service: cannot find 'count' in %v", res)
		}

		result[glyphGroup] = make(map[string]interface{})
		result[glyphGroup]["word"] = word;
		result[glyphGroup]["count"] = count;
		glyphGroup = glyphGroup + 1
	}

	return json.Marshal(result)
}

// Create the request to the remote service.
func (t *WordGlyphTile) GetRequestParameters() map[string]interface{} {
	parameters := make(map[string]interface{})

	log.Debug(t.lod)

	// Add time range parameters.
	time := make(map[string]int64)
	time["from"] = t.timeFrom
	time["to"] = t.timeTo
	parameters["date"] = time
	parameters["word"] = t.wordTerm
	parameters["lod"] = t.lod

	return parameters
}

func (t *WordGlyphTile) GetTileId() string {
	return fmt.Sprintf("%v/%v/%v", t.z, t.x, t.y)
}

