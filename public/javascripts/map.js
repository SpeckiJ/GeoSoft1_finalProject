/**
 * Geosoftware I, SoSe 2017, Aufgabe Abschluss
 * @author Jan Speckamp (428367)
 */

'use strict';

//DEBUG-ONLY
// console.log(loaded_objects);

// Global vars;
var map,
    layercontrol,
    visualizationLayers,
    routeControl,
    currentRoute;


document.addEventListener("DOMContentLoaded", function(event) {
    initMap();
    initUI();
});

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

    // add layer control to map
    //layercontrol = L.control.layers().addTo(map).expand();

    // add standard OSM tiles as basemap
    L.control.layers().addBaseLayer(L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map), 'OpenStreetMap (Tiles)');  // set as default

    //TODO: Do i need this ?
    // Setup Routing Plugin
    routeControl = L.Routing.control({
        waypoints: [
            null
        ],
        routeWhileDragging: true,
        show:true,
        position: 'topleft',
        geocoder: L.Control.Geocoder.nominatim()
    });
    routeControl.addTo(map);

    // Code taken from http://www.liedman.net/leaflet-routing-machine/tutorials/interaction/
    map.on('click', function(e) {
        if (routeSwitch){
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
                map.closePopup();
            });
        }
    });

    routeControl.on('routeselected', function(e) {
        currentRoute = {};
        currentRoute.waypoints = routeControl.getWaypoints();
        currentRoute.route = e.route;

    })


    // layer to draw on
    visualizationLayers = new L.FeatureGroup();
    map.addLayer(visualizationLayers);


// TODO: Start and Ziel Marker Syntax here add marker to map and bind popup
    // make icon with photo of GEO1 as the marker image
    //var geo1icon = L.icon({iconUrl: 'https://www.uni-muenster.de/imperia/md/images/geowissenschaften/geo1.jpg', iconSize: [50, 41]});
    // compose popup with a bit of text and another photo
    //var geo1text = 'Das wundervolle GEO1-Gebäude an der Heisenbergstraße 2 in Münster <img src="http://www.eternit.de/referenzen/media/catalog/product/cache/2/image/890x520/9df78eab33525d08d6e5fb8d27136e95/g/e/geo1_institut_muenster_02.jpg" width="300">';
    //L.marker([51.969031, 7.595772], {title: 'GEO1', icon: geo1icon}).bindPopup(geo1text).addTo(map);
}