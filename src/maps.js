import React, { useState, useEffect, useRef, useContext } from 'react'
import { Map as LeafletMap, TileLayer, Marker, Popup, LayersControl, LayerGroup } from 'react-leaflet';
import axios from 'axios';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import distinct from 'distinct';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { Button } from '@material-ui/core';
import { AppContext } from './App'

//could potentially create a func to make the graph here based each marker

function MapFun() {

    const {state, dispatch} = useContext(AppContext);
    console.log("Maps");
    console.log(state);
    const [controlSet] = useState(
        {
            center: [10, 100],//Start Location
            zoom: 6,
            maxZoom: 16, //changed to 8 to be same with nasa
            attributionControl: true,
            zoomControl: true,
            doubleClickZoom: false,
            scrollWheelZoom: true,
            dragging: true,
            animate: true,
            easeLinearity: 0.35,
        }
    );
    const fetchData = async () => {
        const result = await axios(
            // using axios and not import per future usage
            // './resource/samplegeo.geojson'
            './resource/station.json',
            // this is the one that points to TH 
            // './resource/station_full.json',
        );
        result.data.locations.forEach(element => {
            // console.log(element.station_type);
            element.basin = element.basin || "Empty";
        });
        //console.log(result.data.locations);
        setMarkers(result.data);
        return result.data.locations;
    };
    const [markers, setMarkers] = useState({ locations: [] });
    const [rivers, setRivers] = useState([])
    useEffect(() => {
        console.log("useEffect1");
        waitforFetch();
        var tempinfo = [];
        var temp2 = [];
        async function waitforFetch() {
            tempinfo = await fetchData();

            tempinfo.forEach(element => {
                temp2.push(element.basin)
            });
            //console.log(tempinfo);
            // console.log(distinct(temp2));
            setRivers(distinct(temp2));
            return distinct(temp2);
        }
    }, []);
    const mapRef = useRef();
    var tobepushed =[];
    useEffect(()=>
    {
        const { current = {} } = mapRef;
        const { leafletElement: map } = current;
        setTimeout(() => {
            map.flyTo([10, 100], 6, { duration: 3 })
        }, 1000);
        console.log("stateChanged");
    },[state]);
    useEffect(() => {
        console.log("useEffect2");
        const { current = {} } = mapRef;
        const { leafletElement: map } = current;
        map.on("overlayadd", e=>{
            tobepushed.push(e.name);
            dispatch({ type: 'UPDATE_INPUT', data: tobepushed,});
            console.log(e.name+"add");
        })
        map.on("overlayremove", e=>{
            for(var i = 0; i<tobepushed.length; i++)
            {if(tobepushed[i]===e.name){tobepushed.splice(i,1)}}
            dispatch({ type: 'UPDATE_INPUT', data: tobepushed,});
            console.log(e.name+"poof");
        })
        // setTimeout(() => {
        //     map.flyTo([10, 100], 6, { duration: 3 })
        // }, 1000);
    }, [dispatch]);
    const { BaseLayer, Overlay } = LayersControl;

    const [option, setOptions] = useState(
        {
            //change the settings in the useeffect
            chart: {
                height: 400,
                width: 260,
                type: 'pie'
            },
            title: {
                text: 'Test'
            },
            series: [
                {
                    data: [1, 2, 3, 4, 5, 6, 2, 3, 4, 2, 4, 5, 1, 2, 5, 3, 5, 6, 6, 7, 2]
                }
            ]
        }
    )

    function markerOnClick(e) {
        console.log("markerClicked");
        setflip(false)
        var somuchtemp = e.geocode.split('').map(function (item) {
            return parseInt(item, 10);
        });
        //console.log(somuchtemp);
        //dun work properly dough esk de
        setOptions({
            chart: {
                height: 400,
                width: 260,
            },
            title: {
                text: e.name
            },
            series: [
                {
                    name: "random stuff",
                    data: somuchtemp
                },
                {
                    name: "one two three",
                    data: [1,2,3,3,2,1]
                }
            ]
        })
        //console.log("hi. you clicked the marker");
    }

    const [flipflop, setflip] = useState(false);
    const clicked = () => setflip(!flipflop);
    var hiRef = useRef();
    return (
        //totally feel like this is all clunky and not organized
        <LeafletMap ref={mapRef}
            center={controlSet.center}
            zoom={controlSet.zoom}
            maxZoom={controlSet.maxZoom}
            attributionControl={controlSet.attributionControl}
            zoomControl={controlSet.zoomControl}
            doubleClickZoom={controlSet.doubleClickZoom}
            scrollWheelZoom={controlSet.scrollWheelZoom}
            dragging={controlSet.dragging}
            animate={controlSet.animate}
            easeLinearity={controlSet.easeLinearity}
            worldCopyJump={true}
        >
            <LayersControl>
                <BaseLayer checked name="street">
                    <TileLayer
                        url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
                    />
                </BaseLayer>
                <BaseLayer name="nasa">
                    <TileLayer
                        url='https://gibs-{s}.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default//EPSG3857_500m/{z}/{y}/{x}.jpeg'
                        maxNativeZoom={8}
                    />
                </BaseLayer>
                
                {rivers.map(river => {
                    return  <Overlay name={river} key={river}>
                                <LayerGroup name={"lgroup" + river}>
                                    <MarkerClusterGroup>
                                        {markers.locations.map(item => {
                                            return item.basin === river ? <Marker position={[item.lat, item.lng]} key={item.id} onclick={e => markerOnClick(item)} >
                                                <Popup>
                                                    {flipflop === true ? <HighchartsReact highcharts={Highcharts} options={option} ref={hiRef} /> : null}
                                                    <div id={item.id + "_test"}>
                                                        <h4>ID: {item.id}</h4>
                                                        {item.name}
                                                        <br></br>
                                    Lat : {item.lat}
                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                    Long : {item.lng}
                                                        <br></br>
                                    Basin Name : {item.basin}
                                                    </div>
                                                    <Button variant="contained" color={flipflop === false ? "primary" : "secondary"} onClick={clicked}>BOB</Button>
                                                </Popup>
                                            </Marker> : null
                                        }
                                        )
                                        }
                                    </MarkerClusterGroup>
                                </LayerGroup>
                            </Overlay>
                        
                })}

            </LayersControl>
        </LeafletMap>
    );

}
export default MapFun