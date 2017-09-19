/**
 * Geosoftware I, SoSe 2017, Aufgabe Abschluss
 * @author Jan Speckamp (428367)
 */

'use strict';

// Global vars;
var map,
    route_in_editing,
    route_previously_in_editing,
    routeControl;

var stageid_to_visalizedRoute = [];

/**
 * add resizing capability (curtesy of several StackExchange users)
 */
function initUI() {
    var resize= $("#content");
    var containerWidth = $("body").width();

    $(resize).resizable({
        handles: 'e',
        /*maxWidth: 450,
        minWidth: 120,*/
        classes: { "ui-resizable-handle": "hidden-xs hidden-sm" },
        resize: function(event, ui){
            var currentWidth = ui.size.width;

            // this accounts for padding in the panels +
            // borders, you could calculate this using jQuery
            var padding = 12;

            // this accounts for some lag in the ui.size value, if you take this away
            // you'll get some instable behaviour
            $(this).width(containerWidth - currentWidth - padding);

            // set the content panel width
            $("#content").width(currentWidth);
        }
    });
}

function changeToAccordion(object) {
    search_items(object.id.substr(19));
    document.getElementById("searchform_input").value = object.id.substr(19);
    toggleView("search");
}

function popup_template(objectname,stagename) {
    var popup_template = document.createElement('div');
    popup_template.innerHTML =
        "<strong>"
        + objectname
        + "</strong>"
        + "<br><button id='button_showDetails_"
        + stagename
        + "' onclick='changeToAccordion(this)'>Show Details</button>";
    return popup_template;
};

/**
 * initialises Map
 */
function initMap() {
    map = L.map('map', {
        center: [40.416775, -3.703790], // Madrid
        zoom: 6,
        zoomControl: false
    });
    L.control.zoom({
        position: 'bottomleft'
    }).addTo(map);

    // add standard OSM tiles as basemap
    L.control.layers().addBaseLayer(L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map), 'OpenStreetMap (Tiles)');  // set as default

    // Setup Routing Plugin

    routeControl = L.Routing.control({
        waypoints: [
        ],
        routeWhileDragging: true,
        show:true,
        position: 'topleft',
        geocoder: L.Control.Geocoder.nominatim(),
        lineOptions: {
            styles: [{color: 'green', opacity: 1, weight: 5}]
        },
        // Prevent Default markers
        createMarker: function() { return null; }
    });

    // Code taken from http://www.liedman.net/leaflet-routing-machine/tutorials/interaction/
    /*
    map.on('click', function(e) {
        var container = L.DomUtil.create('div'),
            startBtn = createButton('Start from this location', container),
            destBtn = createButton('Go to this location', container);

        L.popup()
            .setContent(container)
            .setLatLng(e.latlng)
            .openOn(map);
        L.DomEvent.on(startBtn, 'click', function() {
            routeControl.spliceWaypoints(0, 1, e.latlng);
            map.closePopup();
        });
        L.DomEvent.on(destBtn, 'click', function() {
            routeControl.spliceWaypoints(routeControl.getWaypoints().length - 1, 1, e.latlng);
            Dmap.closePopup();
        });
    });
    */

    routeControl.on('routesfound', function(e) {
        // Visualize previously edited layer (which was deleted before)
        var currentRoute = {};
        // Ignore alternative second Route
        currentRoute.coordinates = e.routes[0].coordinates;
        currentRoute.waypoints = e.routes[0].waypoints;
        // connect to actually loaded Object
        route_in_editing.values.route = currentRoute;
        if(route_previously_in_editing == undefined) {route_previously_in_editing.id={}};
        for(var i = 0; i < stageid_to_visalizedRoute.length; i++) {
            // Add deleted visualization
            if (stageid_to_visalizedRoute[i].stageid === route_previously_in_editing.id){
                map.addLayer(stageid_to_visalizedRoute[i].layer);
            }
            // Delete current Route visualization
            if (stageid_to_visalizedRoute[i].stageid === route_in_editing.id){
                map.removeLayer(stageid_to_visalizedRoute[i].layer);
            }
        }
        save_object_in_db(route_in_editing, 'PUT', '/api/' + route_in_editing.id);
        // get_objects_by_id([route_previously_in_editing.id]);
    });

    // Add Objects to map
    var objects = loaded_objects_invisible.concat(loaded_objects_visible);
    console.log("All Objects to be added to Map" + objects);
    var featureGroups = [];
    for(var i = 0, n = objects.length; i<n; i++) {
        var object = objects[i].values;
        // Add Start Marker
        var layer = new L.FeatureGroup();
        var layer_ids = [];
        var tmp;

        //TODO: Add Link to Object in Accordion to Popup
        tmp = L.marker([object.startLocation.coords.x,object.startLocation.coords.y], {title: object.startLocation.name})
            .bindPopup(popup_template(object.startLocation.name, object.name))
            .addTo(layer);
        layer_ids.push(tmp._leaflet_id);
        tmp = L.marker([object.endLocation.coords.x,object.endLocation.coords.y], {title: object.endLocation.name})
            .bindPopup(popup_template(object.endLocation.name, object.name))
            .addTo(layer);
        layer_ids.push(tmp._leaflet_id);

        //TODO: Custom Marker?
        for(var x = 0, m = object.parking.length; x<m;x++) {
            tmp = L.marker([object.parking[x].coords.x,object.parking[x].coords.y], {title: object.parking[x].name})
                .bindPopup(popup_template(object.parking[x].name, object.name))
                .addTo(layer);
            layer_ids.push(tmp._leaflet_id);
        }
        tmp = L.geoJSON(RouteToGeoJSON(object.route));
        stageid_to_visalizedRoute.push({
            "stageid": objects[i].id,
            "layer": tmp
        });
        tmp.addTo(layer);

        // Save connection layer <-> objectID
        featureGroups.push({
            "id": objects[i].id,
            "layer": layer_ids
        });

        // Make Route editable when clicked on.
        layer.on('click', function (e) {
            // Get stage_id for clicked layer.
            // Cause I dont really know Javascript we gonna do it the verbose way
            // Complexity: O(n) ?= n^3
            var tmp2 = featureGroups.length;
            for (var f = 0, b = tmp2; f<b; f++){
                var maplayer = featureGroups[f];
                for (var l = 0, n = maplayer.layer.length; l<n; l++) {
                    if(maplayer.layer[l] === e.layer._leaflet_id){
                        var objectlist = loaded_objects_invisible.concat(loaded_objects_visible);
                        for(var j =0, m = objectlist.length; j<m; j++){
                            if (objectlist[j].id === maplayer.id) {
                                // objectlist[j] contains reference to stage
                                var stage = objectlist[j].values;
                                route_previously_in_editing = route_in_editing;
                                route_in_editing = objectlist[j];
                                routeControl.setWaypoints(stage.route.waypoints);
                                routeControl.addTo(map);
                                break;
                            }
                        }
                    }
                }
            }
        });
        layer.addTo(map);
    }
}

// Credit to https://github.com/perliedman/leaflet-routing-machine/blob/344ff09c8bb94d4e42fa583286d95396d8227c65/src/L.Routing.js
function RouteToGeoJSON(route){
    var wpNames = [],
        wpCoordinates = [],
        i,
        wp,
        latLng;

    for (i = 0; i < route.waypoints.length; i++) {
        wp = route.waypoints[i];
        latLng = L.latLng(wp.latLng);
        wpNames.push(wp.name);
        wpCoordinates.push([latLng.lng, latLng.lat]);
    }
    return {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {
                    id: 'line',
                },
                geometry: routeToLineString(route)
            }
        ]
    };
}

// Credits to https://github.com/perliedman/leaflet-routing-machine/blob/344ff09c8bb94d4e42fa583286d95396d8227c65/src/L.Routing.js
function routeToLineString(route) {
    var lineCoordinates = [],
        i,
        latLng;

    for (i = 0; i < route.coordinates.length; i++) {
        latLng = L.latLng(route.coordinates[i]);
        lineCoordinates.push([latLng.lng, latLng.lat]);
    }

    return {
        type: 'LineString',
        coordinates: lineCoordinates
    };
}

// Code taken from http://www.liedman.net/leaflet-routing-machine/tutorials/interaction/
function createButton(label, container) {
    var btn = L.DomUtil.create('button', '', container);
    btn.setAttribute('type', 'button');
    btn.innerHTML = label;
    return btn;
}