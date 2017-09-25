/**
 * Geosoftware I, SoSe 2017, final
 * @author Jan Speckamp (428367)
 */

'use strict';

// Global vars;
var map, // Map Object
    route_in_editing, // Reference to Route currently in RM
    route_previously_in_editing, // Reference to Route previously in RM
    routeControl, // RM
    layerControl, 
    sidebar, 
    route, // Route that is currently in RM
    temporary_markers = [], // Array with Markers
    marker_not_saved = true, // 
    contextmenu_latlng, // Coordinates of leftclick <-> coordinates of marker <-> coordinates of Popup
    navigationControl, // Second RM to show navigation to Parking Lot
    route_in_routeControl = false; //

var stageid_to_visalizedRoute = []; // Association Element between StageID and Layer

/**
 * Returns Information Popup for markers.
 */
function popup_template(objectname,stagename, parkingtype) {
    var popup_template = document.createElement('div');
    var html =
        "<strong>"
        + objectname
        + "</strong><br>"
        + "<br><button id='button_showDetails_"
        + stagename
        + "' onclick='search_items();sidebar.open(&quot;search&quot;);'>Show Details</button>";

    if (parkingtype === "Stands") {
       html +=
         "<br><br><button id='button_navigateFrom_"
        + objectname
        + "' onclick='navigateToClosestParkinglot(this)'>Find Closest Parking Lot</button>";
    }
    popup_template.innerHTML = html;
    return popup_template;
};

/**
 * Initialises Map Object
 */
function initMap() {
    map = L.map('map', {
        center: [40.416775, -3.703790], // Madrid
        zoom: 6,
        zoomControl: false
    });
    L.control.zoom({
        position: 'bottomright'
    }).addTo(map);

    // add standard OSM tiles as basemap
    layerControl = L.control.layers().addBaseLayer(L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map), 'OpenStreetMap (Tiles)').addTo(map).expand();

    // Setup Routing Plugin
    routeControl = L.Routing.control({
        // serviceUrl: "http://localhost:5000/route/v1", for development only
        routeWhileDragging: false,
        fitSelectedRoutes: false,
        show:true,
        position: 'topright',
        lineOptions: {
            styles: [{color: 'green', opacity: 1, weight: 5}]
        },
        // Prevent Default markers
        createMarker: function() { return null; },
    }).addTo(map);

    // Set up Sidebar and Startpage
    sidebar = L.control.sidebar('sidebar').addTo(map);
    sidebar.open('home');

    // Controls via left Mouse Button
    map.on('contextmenu', function(e) {
        var htmlcontent = "";
        // Clear Marker when Popup is closed without saving
        marker_not_saved = true;
        // Set Marker Position into global var
        contextmenu_latlng = e.latlng;
        // Show different Options depending on circumstances
        if (route_in_editing !== undefined) {
            htmlcontent += "<button onclick='addParkingStandsPopup(this);'>Add Parking/Stands</button><br><br>";
            htmlcontent += "<button onclick='addMiscellaneousPopup(this);'>Add Miscellaneous</button><br><br>";
        }
        if ($('#createStageCollapsible').hasClass('in') || route_in_editing !== undefined) {
            htmlcontent += "<button onclick='setRouteStartpoint(&quot;" + e.latlng + "&quot;);'>Set Startpoint</button><br><br>";
            htmlcontent += "<button onclick='setRouteEndpoint(&quot;" + e.latlng + "&quot;);'>Set Endpoint</button><br><br>";
            // Replace old Marker with new one
            var marker = new L.marker(contextmenu_latlng).addTo(map);
            var popup = new L.popup().setContent(htmlcontent);
            marker.bindPopup(popup).openPopup().update();
            marker.on('popupclose', function (e) {
                if (marker_not_saved) {
                    marker.remove();
                }
            });
        }
    });
    // Do Things when RM returns route
    routeControl.on('routesfound', function(e) {
        // On first Creation of Route we no need to worry about visualizations!
        if (route_in_editing === undefined){
            // Set Waypoint in stageForm
            $('#stage_startlocation_coords').attr('value', e.routes[0].waypoints[0].latLng.lat + "," + e.routes[0].waypoints[0].latLng.lng);
            $('#stage_endlocation_coords').attr('value',e.routes[0].waypoints[1].latLng.lat + "," + e.routes[0].waypoints[1].latLng.lng);
            route = e.routes[0];
        } else {
            // Set flag to prevent overdrawing by save Function
            route_in_routeControl = true;
            // Visualize previously edited layer (Visualization was deleted earlier)
            // Update Route
            route_in_editing.values.route.coordinates = e.routes[0].coordinates;
            route_in_editing.values.route.waypoints = e.routes[0].waypoints;
            // Prevent Error on first Edit.
            if (route_previously_in_editing === undefined || route_in_editing === route_previously_in_editing) {
                route_previously_in_editing = {};
                route_previously_in_editing.id = {};
            };
            if (route_in_editing !== route_previously_in_editing) {
                // Remove old visualization - Add previously removed one
                for (var i = 0; i < stageid_to_visalizedRoute.length; i++) {
                    // Add deleted visualization
                    if (stageid_to_visalizedRoute[i].stageid === route_previously_in_editing.id) {
                        get_stages_and_visualize(route_previously_in_editing.id);
                        /*map.addLayer(stageid_to_visalizedRoute[i].actualLayer);
                        layerControl.addOverlay(stageid_to_visalizedRoute[i].actualLayer, route_previously_in_editing.id);*/
                    }
                    // Delete current Route visualization
                    if (stageid_to_visalizedRoute[i].stageid === route_in_editing.id) {
                        map.removeLayer(stageid_to_visalizedRoute[i].geojsonRoute);
                        layerControl.removeLayer(stageid_to_visalizedRoute[i].actualLayer);
                    }
                }
            }
            // Save updated Routes in DB
            save_stage_in_db(route_in_editing, 'POST', '/api/' + route_in_editing.id);
            map.invalidateSize();
        }
    });
}

/**
 * Adds Popup with form to Create Misc Object
 */
function addMiscellaneousPopup(that) {
    var tmp = '<form id="saveMarker" class="tabledisplay">' +
        '<p><label> <strong>Name: </strong></label>' +
        '<input type="text" id="name" name="name" required="true"/>' +
        '</p><br><p><label><strong>Type: </strong></label>' +
        '<select type="text" id="type" name="type" required="true"/>' +
        '<option value="Misc">Miscellaneous</option></select>' +
        '<input class="hidden"  min="0" id="cap" name="capacity" value="-9999"/>' +
        '<input class="hidden"  min="0" id="price" name="price" value ="-9999"/>' +
        '</p><br><p><label><strong>Picture: </strong></label>' +
        '<input type="text" id="picture" name="picture"/>' +
        '</p><br><p><label><strong>Description: </strong></label>' +
        '<textarea class="form-control" rows="1" id="info" name="description"></textarea>' +
        '<p><br><div style="text-align:center;"><button type="submit" value="Save" class="btn btn-primary trigger-submit">Save</button></div>' + '</div>' +
        '</form>';
    createObjectCreationPopup(tmp);
}

/**
 * Adds Popup with Form to Create Parking or Stands Object.
 */
function addParkingStandsPopup(that){
    // Input form for Objects
    var tmp = '<form id="saveMarker" class="tabledisplay">' +
    '<p><label> <strong>Name: </strong></label>' +
    '<input type="text" id="name" name="name" required="true"/>' +
    '</p><br><p><label><strong>Type: </strong></label>' +
    '<select type="text" id="type" name="type" required="true">' +
    '<option value="Parking">Parking</option><option value="Stands">Stands</option></select>' +
    '</p><br><p><label><strong>Capacity: </strong></label>' +
    '<input type="number" min="0" id="cap" name="capacity" required="true">' +
    '</p><br><p><label><strong>Price: </strong></label>' +
    '<input type="number" min="0" id="price" name="price" required"true">' +
    '</p><br><p><label><strong>Description: </strong></label>' +
    '<textarea class="form-control" rows="1" id="info" name="description"></textarea>' +
    '<input class="hidden" value="-9999" type="text" id="picture" name="picture"/>' +
    '<div style="text-align:center;"><button type="submit" value="Save" class="btn btn-primary trigger-submit">Save</button></div>' + '</div>' +
    '</form>';
    createObjectCreationPopup(tmp);
}

function createObjectCreationPopup(htmlcontent) {
    // Close Selection Popup + Create new Input Popup
    map.closePopup();
    var marker = new L.marker(contextmenu_latlng).addTo(map);
    var popup = new L.popup().setContent(htmlcontent);
    marker.bindPopup(popup).openPopup().update();

    // Clear Marker when Popup is closed without saving
    marker_not_saved = true;
    marker.on('popupclose', function (e) {
        if (marker_not_saved) {
            marker.remove();
        }
    });

    // AJAX to save Object
    $('#saveMarker').submit(function (e) {
        console.log("overwriting submit handler");
        e.preventDefault();
        save_object_in_db(this, marker);
    });
}

/**
 * Saves Objected from the Form Submit Event to Database
 * @param Form Submit Event
 */

function save_object_in_db(that, marker){
    marker_not_saved = false;
    // Create new Parking Object
    route_in_editing.values.parking.push({
        "name": that.elements["name"].value,
        "type": that.elements["type"].value,
        "coords": {
            "x": contextmenu_latlng.lat,
            "y": contextmenu_latlng.lng
        },
        "capacity":that.elements["capacity"].value,
        "price": that.elements["price"].value,
        "description": that.elements["description"].value,
        "picture": that.elements["picture"].value
    });
    // Save updated Routes in DB
    save_stage_in_db(route_in_editing, 'POST', '/api/' + route_in_editing.id);

    // Set marker to appropiate Icon
    if (that.elements["type"].value === "Parking") {
        marker.setIcon(L.icon({iconUrl: '/images/Parking_icon.svg',iconSize: [20, 20]}));
    } else if (that.elements["type"].value === "Stands"){
        marker.setIcon(L.icon({iconUrl: '/images/Stands.png',iconSize: [20, 20]}));
    } else {
        marker.setIcon(L.icon({iconUrl: '/images/information.png',iconSize: [20, 20]}));
    }
    // Replace Form Popup with Info Popup
    map.closePopup();
    marker.bindPopup(popup_template(that.elements["name"].value,route_in_editing.values.name, that.elements["type"].value)).openPopup();
    // Refresh Item List
    search_items();
}

/**
 * Sets the first Waypoint in the RM to the Location of the last opened Popup
 */
function setRouteEndpoint(LatLngString){
    var coords = LatLngString.slice(7,-1);
    var latlng = new L.latLng(coords.split(','));
    routeControl.spliceWaypoints(routeControl.getWaypoints().length - 1, 1, latlng);
    temporary_markers.push(L.marker(latlng, {title: "End Location"})
        .addTo(map));
}
/**
 * Sets the last Waypoint in the RM to the Location of the last opened Popup
 */
function setRouteStartpoint(LatLngString) {
    var coords = LatLngString.slice(7,-1);
    var latlng = new L.latLng(coords.split(','));
    routeControl.spliceWaypoints(0, 1, latlng);
    temporary_markers.push(L.marker(latlng, {title: "Start Location"})
        .addTo(map)
    )
}

/**
 * Visualizes given Stages on the Map.
 */
function addStagesToMap(stages) {
    var featureGroups = [];
    for (var i = 0, n = stages.length; i < n; i++) {
        var object = stages[i].values;
        var layer = new L.FeatureGroup(); // Layer where are Stage Objects are added
        var layer_ids = []; // Ids of all the leaflet items
        var tmp;

        // Marker for Start Waypoints
        tmp = L.marker(object.route.waypoints[0].latLng, {title: object.startLocation.name,icon: L.icon({iconUrl: '/images/start.png',iconSize: [20,20]})})
            .bindPopup(popup_template(object.startLocation.name, object.name, "Stands"))
            .addTo(layer);
        layer_ids.push(tmp._leaflet_id);
        // Marker for Finish Waypoint
        tmp = L.marker(object.route.waypoints[object.route.waypoints.length -1].latLng, {title: object.endLocation.name,icon: L.icon({iconUrl: '/images/finish.png',iconSize: [20,20]})})
            .bindPopup(popup_template(object.endLocation.name, object.name, "Stands"))
            .addTo(layer);
        layer_ids.push(tmp._leaflet_id);
        // Markers for all Objects
        for (var x = 0, m = object.parking.length; x < m; x++) {
            // choose correct Icon
            var options;
            if (object.parking[x].type === "Parking"){
                options = {title: object.parking[x].name, icon: L.icon({iconUrl: '/images/Parking_icon.svg',iconSize: [20,20]})}
                } else {
                options = {title: object.parking[x].name, icon: L.icon({iconUrl: '/images/Stands.png',iconSize: [20,20]})};
            }
            tmp = L.marker([object.parking[x].coords.x, object.parking[x].coords.y],options)
                .bindPopup(popup_template(object.parking[x].name, object.name, object.parking[x].type))
                .addTo(layer);
            layer_ids.push(tmp._leaflet_id);
        }

        // Delete old Visualizations
        for (var z = 0; z < stageid_to_visalizedRoute.length; z++){
            if (stageid_to_visalizedRoute[z].stageid === stages[i].id){
                map.removeLayer(stageid_to_visalizedRoute[z].actualLayer);
                layerControl.removeLayer(stageid_to_visalizedRoute[z].actualLayer);
                stageid_to_visalizedRoute.splice(z,1);
            }
        }

        // Connect StageId to Visualization (blue route)
        var geojsonRoute = L.geoJSON(RouteToGeoJSON(object.route)).addTo(layer);
        stageid_to_visalizedRoute.push({
            "stageid": stages[i].id,
            "geojsonRoute": geojsonRoute,
            "actualLayer": layer
        });

        // Connect StageID to Layer with complete Stage
        featureGroups.push({
            "id": stages[i].id,
            "layer": layer_ids
        });
        // Add Layer to LayerControl
        layerControl.addOverlay(layer, object.name);

        // Make Route editable when clicked on.
        layer.on('click', function (e) {
            if (navigationControl !== undefined){
                navigationControl.remove();
            }
            // Get stage_id for clicked layer.
            // Cause I dont really know Javascript we gonna do it the verbose way
            // Complexity: O(n) ?= n^3
            var tmp2 = featureGroups.length;
            for (var f = 0, b = tmp2; f < b; f++) {
                var maplayer = featureGroups[f];
                for (var l = 0, n = maplayer.layer.length; l < n; l++) {
                    if (maplayer.layer[l] === e.layer._leaflet_id) {
                        var objectlist = loaded_objects_invisible.concat(loaded_objects_visible);
                        for (var j = 0, m = objectlist.length; j < m; j++) {
                            if (objectlist[j].id === maplayer.id) {
                                // Delete Temporary markers
                                removeTempMarkers();
                                // Close Creation form
                                $(".panel-collapse").collapse("hide");
                                $("#createStageForm").trigger('reset');
                                // objectlist[j] contains reference to stage
                                var stage = objectlist[j].values;
                                if (route_previously_in_editing !== route_in_editing || route_previously_in_editing === undefined) {
                                    route_previously_in_editing = route_in_editing;
                                    route_in_editing = objectlist[j];
                                    routeControl.setWaypoints(stage.route.waypoints);
                                    routeControl.addTo(map);
                                }
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

/**
 * Clears all temporary Markers saved in temporary_markers from map
 */
function removeTempMarkers(){
    for(var r = 0; r < temporary_markers.length; r++){
        temporary_markers[r].remove();
    }
}

/**
 * Creates second Routing Machine and displays shortest Route to next Parking.
 */
function navigateToClosestParkinglot(that){
    var parkinglots = [];
    var start;
    // Get all ParkingLot coordinates and save them in turf-compatible format
    // If StartLocation is Object also save coordinates
    for (var i =0; i < route_in_editing.values.parking.length; i++){
        var parking = route_in_editing.values.parking[i];
        if (parking.type === "Parking"){
            parkinglots.push(turf.helpers.point([parking.coords.x, parking.coords.y], {"name": parking.name}));
        } else if (parking.name === that.id.substr(20)){
            start = turf.helpers.point([parking.coords.x, parking.coords.y], {"name": parking.name});
        }
    }
    // If Start was not set as it is not an Object. check if startobject is startlocation else it is endlocation.
    if (start === undefined){
        var wp = route_in_editing.values.route.waypoints;
        if (that.id.substr(20) === route_in_editing.values.startLocation.name) {
            start = turf.helpers.point([wp[0].latLng.lat, wp[0].latLng.lng]);
        }else {
            start = turf.helpers.point([wp[wp.length-1].latLng.lat, wp[wp.length-1].latLng.lng]);
        }
    }
    // Calculate Nearest Parking using turf 
    var nearest = turf.nearest(start, turf.helpers.featureCollection(parkinglots));
    // If there is a nearest Parking create RM
    if (nearest !== undefined) {
        navigationControl = L.Routing.control({
            // serviceUrl: "http://localhost:5000/route/v1", for development only
            routeWhileDragging: false,
            fitSelectedRoutes: true,
            show: true,
            position: 'topright',
            lineOptions: {
                styles: [{color: 'red', opacity: 1, weight: 5}]
            },
            createMarker: function() { return null; },
        }).addTo(map);
        navigationControl.setWaypoints([
            new L.latLng(start.geometry.coordinates[0], start.geometry.coordinates[1]),
            new L.latLng(nearest.geometry.coordinates[0], nearest.geometry.coordinates[1])
        ])
    } else {
        alert("No Parking Lots associated with this Stage.");
    }
}