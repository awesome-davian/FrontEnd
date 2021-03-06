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

type GeoPointTile struct {
	APITile
	date int64
	wordTerm string
	lod int
	tile.Macro
}

func NewGeoPointTile() veldt.TileCtor {
	return func() (veldt.Tile, error) {
		return &GeoPointTile{}, nil
	}
}

func (t *GeoPointTile) Parse(params map[string]interface{}) error {

	// log.Debug(params);

	word, ok := jsonUtil.GetString(params, "word")
	if !ok {
		return fmt.Errorf("`word` parameter missing from geopoint tile")
	}

	// get time from
	date, ok := jsonUtil.GetNumber(params, "timeFrom")
	if !ok {
		return fmt.Errorf("`timeFrom` parameter missing from geopoint tile")
	}
	// // get time time
	// timeTo, ok := jsonUtil.GetNumber(params, "timeTo")
	// if !ok {
	// 	return fmt.Errorf("`timeTo` parameter missing from geopoint tile")
	// }

	t.date = int64(date)
	// t.timeTo = int64(timeTo)
	t.wordTerm = word

	// Use hash of all parameters to identify request.
	requestId := fmt.Sprintf("%v::%v", date, word)
		// timeFrom, timeTo)

	t.requestId = requestId
	t.tileType = "geopoint"

	return t.Macro.Parse(params)
}

func (t *GeoPointTile) GetApiUrl() string {
	// TODO: Have the URL configurable!
	return "http://163.152.20.64:5001/GET_GEOPOINT/test"
}

func (t *GeoPointTile) Create(uri string, coord *binning.TileCoord, query veldt.Query) ([]byte, error) {

	// Setup the tile coordinate information.
	
	t.x = coord.X
	t.y = coord.Y
	t.z = coord.Z

	t.lod = 4

	// Send the request to the batching client and wait for the response.
	client := getServiceClient(t)
	resChan, err := client.AddRequest(t)
	if err != nil {
		return nil, err
	}

	res := <-resChan

	// log.Debug(res);

	// Either an error, or the response from the remote service.
	err, ok := res.(error)
	if ok {
		return nil, err
	}



	resolution := uint32(256)
	binSize := binning.MaxTileResolution / float64(resolution)
	// halfSize := float64(binSize / 2)

	// log.Debug(binSize)

	var tmpGeoPointParsed interface{}
	err = json.Unmarshal([]byte(res.(string)), &tmpGeoPointParsed)
	if err != nil {
		return nil, err
	}

	geoPointParsed, ok := tmpGeoPointParsed.(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("Unexpected response format from topic modelling service for geopoint tile: incorrect structure in %v", res)
	}

	res_geopoints, ok := jsonUtil.GetArray(geoPointParsed, "points")

	if !ok {
		return nil, fmt.Errorf("Unexpected response format from topic modelling service: could not parse geopoints from %v", res)
	}

	bins := len(res_geopoints)
	points := make([]float32, bins*2)
	numPoints := 0

	for _, point := range res_geopoints {

		pointMap, ok := point.(map[string]interface{})
		if !ok {
			return nil, fmt.Errorf("Unexpected response format from topic modelling service: incorrect point structure in %v", res)
		}

		res_xbin, ok := jsonUtil.GetNumber(pointMap, "xbin")
		if !ok {
			return nil, fmt.Errorf("Unexpected response format from topic modelling service: incorrect xbin structure in %v", res)
		}

		res_ybin, ok := jsonUtil.GetNumber(pointMap, "ybin")
		if !ok {
			return nil, fmt.Errorf("Unexpected response format from topic modelling service: incorrect ybin structure in %v", res)
		}

		x := float32(float64(res_xbin)*binSize )
		y := float32(float64(res_ybin)*binSize )

		points[numPoints*2] = x
		points[numPoints*2+1] = y
		numPoints++
	}	

	// log.Debug(points)

	// bins := int(100)
	// points := make([]float32, bins*2)
	// numPoints := 0
	// for i := 0; i < bins; i++ {

	// 	xbin := rand.Intn(255)
	// 	ybin := rand.Intn(255)

	// 	x := float32(float64(xbin)*binSize )
	// 	y := float32(float64(ybin)*binSize )
	// 	points[numPoints*2] = x
	// 	points[numPoints*2+1] = y
	// 	numPoints++
	// }

	return t.Macro.Encode(points[0 : numPoints*2])
	// return nil, nil

	// log.Debug(t.Resolution)

	// Encode the results. Extract all the topics and use the score for weighing.
	// Result is a string containing the JSON. Need to get to the topics.
	// var tmpGeoPointParsed interface{}
	// err = json.Unmarshal([]byte(res.(string)), &tmpGeoPointParsed)
	// if err != nil {
	// 	return nil, err
	// }

	// geopointParsed, ok := tmpGeoPointParsed.(map[string]interface{})
	// if !ok {
	// 	return nil, fmt.Errorf("Unexpected response format from topic modelling service for geopoint tile: incorrect structure in %v", res)
	// }

	// geopoints := make(map[string]float64)
	// geopointValues, ok := jsonUtil.GetArray(geopointParsed, "points")
	// if !ok {
	// 	return nil, fmt.Errorf("Unexpected response format from topic modelling service: could not parse points from %v", res)
	// }

	// geoPoints := float32(0)
	// for _, gp := range geopointValues {
	// 	geopointMap, ok := gp.(map[string]interface{})
	// 	if !ok {
	// 		return nil, fmt.Errorf("Unexpected response format from topic modelling service: incorrect geopoints structure in %v", res)
	// 	}

	// 	lon, ok := jsonUtil.GetNumber(geopointMap, "lon")
	// 	if !ok {
	// 		return nil, fmt.Errorf("Unexpected response format from topic modelling service: incorrect lon structure in %v", res)
	// 	}

	// 	lat, ok := jsonUtil.GetNumber(geopointMap, "lat")
	// 	if !ok {
	// 		return nil, fmt.Errorf("Unexpected response format from topic modelling service: incorrect lat structure in %v", res)
	// 	}

	// 	geopoints["lon"] = lon
	// 	geopoints["lat"] = lat
	// 	// geopointValues = geopoints
	// }

	// return nil, nil

	// convert single value to byte array
	// bits := make([]byte, 4)
	// binary.LittleEndian.PutUint32(
	// 	bits[0:4],
	// 	uint32(geopointValue*10))
	// return bits, nil
}

// Create the request to the remote service.
func (t *GeoPointTile) GetRequestParameters() map[string]interface{} {
	parameters := make(map[string]interface{})

	parameters["date"] = t.date
	parameters["word"] = t.wordTerm
	parameters["lod"] = t.lod

	return parameters
}

func (t *GeoPointTile) GetTileId() string {
	return fmt.Sprintf("%v/%v/%v", t.z, t.x, t.y)
}

