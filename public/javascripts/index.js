
var loaded_objects_visible = [];
var loaded_objects_invisible = [];
var startlocation_wikipedia;
var endlocation_wikipedia;

function create_datalist() {
    var objects = loaded_objects_visible.concat(loaded_objects_invisible);
    objects.forEach(function (t) {
        var opt1 = $("<option></option>").attr("value", t.id);
        $("#stagename").append(opt1);
    })
}

function edit_stage(button){
    var panel = $("#panel_" + button.id.substr(17)).find(".panel-collapse");
    var template = $("#createStageForm").clone();
    panel.addClass("in");
    panel = panel.find(".panel-body");
    panel.empty();
    // Add Form
    panel.append(template);

    // Get Item from Collection
    var object;
    var collection = loaded_objects_visible.concat(loaded_objects_invisible);
    for (var i = 0, n = collection.length; i<n;i++) {
        if(collection[i].id === button.id.substr(17)) {
            object = collection[i];
        }
    }
    // Fill Form with values
    panel.find("#stage_id")[0].value = object.id;
    panel.find("#stage_name")[0].value = object.values.name;
    panel.find("#stage_type")[0].value = object.values.type;
    panel.find("#stage_startDate")[0].value = object.values.startDate;
    panel.find("#stage_endDate")[0].value = object.values.endDate;
    panel.find("#stage_startlocation_coords")[0].value = object.values.startLocation.coords.x + "," + object.values.startLocation.coords.y;
    panel.find("#stage_startlocation_name")[0].value = object.values.startLocation.name;
    panel.find("#stage_startlocation_image")[0].value = object.values.startLocation.image;
    panel.find("#stage_startlocation_website")[0].value = object.values.startLocation.website;
    panel.find("#stage_endlocation_coords")[0].value = object.values.endLocation.coords.x + "," + object.values.endLocation.coords.y;
    panel.find("#stage_endlocation_name")[0].value = object.values.endLocation.name;
    panel.find("#stage_endlocation_image")[0].value = object.values.endLocation.image;
    panel.find("#stage_endlocation_website")[0].value = object.values.endLocation.website;
    panel.find("#stage_waypoints")[0].value = object.values.waypoints;
    panel.find("#stage_description")[0].value = object.values.description;
    panel.find("#stage_pictures")[0].value = object.values.pictures;

    // Overwrite Submit Handler
    template.submit(function(e) {
        return submit_StageForm(e, this, 'POST');

    });
    panel.addClass('in');
}
function delete_stage(button) {
    var panel = $("#panel_" + button.id.substr(17)).find(".panel-collapse");

//TODO: Implement=
}


/**
 * Gets Objects from API
 */
function get_objects_by_id(idlist) {
    var ajaxcalls = [];
    for (var i = 0 , n = idlist.length; i<n; i++) {
        // submit via ajax
        ajaxcalls.push($.ajax({
            // catch custom response code.
            statusCode: {
                500: function() {
                    //ERROR on server-side;
                    console.error("Object not found");
                }
            },
            data: '',
            type: 'GET',
            contentType: "application/json",
            // Dynamically create Request URL by appending requested name to /api prefix
            url:  '/api/'+idlist[i],
            error: function(xhr, status, err) {
                //TODO: Proper Error logging
                console.log(err);
            },
            success: function(res) {
                loaded_objects_invisible.push(res[0]);
                search_items("");
            }
        }));
    };
    $.when.apply($, ajaxcalls).then(
        search_items(""), initMap()
    );
}


/**
 * Gets Content from Wikipedia
 */
function get_wikipedia_intro(idlist) {
    for (var i = 0 , n = idlist.length; i<n; i++) {
        // submit via ajax
        var t = idlist[i];
        $.ajax({
            // catch custom response code.
            data: '',
            type: 'GET',
            contentType: "application/json",
            headers: { 'Api-User-Agent': 'Study Project. [Contact: j_spec05@wwu.de]/' },
            // Dynamically create Request URL by appending requested name to /api prefix
            url:  'https://en.wikipedia.org/w/api.php?format=json&origin=*&action=query&prop=extracts&redirects=1&exintro=&explaintext=&titles='+t.values.startLocation.name,
            error: function(xhr, status, err) {
                //TODO
                console.log(err);
            },
            success: function(res) {
                var pages = res.query.pages;
                var key = Object.keys(pages)[0];
                startlocation_wikipedia = res.query.pages[key].extract;
            }
        }).then(function () {
            document.getElementById('startlocation_' + t.id).innerHTML = "Wikipedia <a href='https://en.wikipedia.org/w/api.php?format=json&origin=*&action=query&prop=extracts&redirects=1&exintro=&explaintext=&titles='" + t.values.startLocation.name+ "'>(source)</a>: <br>" + startlocation_wikipedia;
        });
        $.ajax({
            // catch custom response code.
            data: '',
            type: 'GET',
            contentType: "application/json",
            headers: { 'Api-User-Agent': 'Study Project. [Contact: j_spec05@wwu.de]/' },
            // Dynamically create Request URL by appending requested name to /api prefix
            url:  'https://en.wikipedia.org/w/api.php?format=json&origin=*&action=query&prop=extracts&redirects=1&exintro=&explaintext=&titles='+t.values.endLocation.name,
            error: function(xhr, status, err) {
                //TODO
                console.log(err);
            },
            success: function(res) {
                var pages = res.query.pages;
                var key = Object.keys(pages)[0];
                endlocation_wikipedia = res.query.pages[key].extract;
            }
        }).then(function () {
            document.getElementById('endlocation_' + t.id).innerHTML = "Wikipedia <a href='https://en.wikipedia.org/w/api.php?format=json&origin=*&action=query&prop=extracts&redirects=1&exintro=&explaintext=&titles='" + t.values.endLocation.name+ "'>(source)</a>: <br>" + endlocation_wikipedia;
        });
    };
}

var demoitems =
    [
        {
            "id": "etappe_1_id",
            "values": {
                    "name": "etappe_1_name",
                    "type": "Etappe",
                    "startDate":"21/09/1008",
                    "endDate":"21/12/1008",
                    "route": {},
                    "startLocation":
                    {
                        "coords":{"x": 41, "y": 0},
                        "name":"Saragossa",
                        "image":"asdfasdfasdf",
                        "website": "",
                    },
                    "endLocation":
                    {
                        "coords":{"x": 42, "y": 2},
                        "name":"Manresa",
                        "image":"asdfasdfasdf",
                        "website": "",
                    },
                    "description": "Beschreibung der Etappe 1",
                    "pictures": [
                        "http://www.reise-nach-italien.de/pisa01.jpg",
                        "http://www.reise-nach-italien.de/pisa01.jpg",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwBTNi5EWtu3VUspEzbPPSH4meDSRY_gfGM0hjBsuX8G2V5AjfU6f5_Q"
                    ],
                    "parking": [
                        {
                            "id": "parking1",
                            "type": "Parking",
                            "coords": {
                                "x": 41,
                                "y": 1,
                            },
                            "name": "Parkplatz1",
                            "price": 555,
                            "capacity": 2323,
                        },
                        {
                            "id": "parking2",
                            "type": "Parking",
                            "coords": {
                                "x": 42,
                                "y": 3,
                            },
                            "name": "Parkplatz2",
                            "price": 222,
                            "capacity": 1111,
                        },
                    ],
                }
        }
    ];

var newobject;

function submit_StageForm(e, that, method){
    e.preventDefault();
    // Create Object
    newobject = {};
    newobject.id = that.elements["stage_id"].value;
    newobject.values = {};
    newobject.values.name = that.elements["stage_name"].value;
    newobject.values.type =that.elements["stage_type"].value;
    newobject.values.startDate = that.elements["stage_startDate"].value;
    newobject.values.endDate = that.elements["stage_endDate"].value;
    newobject.values.startLocation = {};
    newobject.values.startLocation.name = that.elements["stage_startlocation_name"].value;
    newobject.values.startLocation.coords = {};
    newobject.values.startLocation.coords.x = parseFloat(that.elements["stage_startlocation_coords"].value.split(',')[0]);
    newobject.values.startLocation.coords.y = parseFloat(that.elements["stage_startlocation_coords"].value.split(',')[1]);
    newobject.values.startLocation.image = that.elements["stage_startlocation_image"].value;
    newobject.values.startLocation.website = that.elements["stage_startlocation_website"].value;
    newobject.values.endLocation = {};
    newobject.values.endLocation.name = that.elements["stage_endlocation_name"].value;
    newobject.values.endLocation.coords = {};
    newobject.values.endLocation.coords.x = parseFloat(that.elements["stage_endlocation_coords"].value.split(',')[0]);
    newobject.values.endLocation.coords.y = parseFloat(that.elements["stage_endlocation_coords"].value.split(',')[1]);
    newobject.values.endLocation.image = that.elements["stage_endlocation_image"].value;
    newobject.values.endLocation.website = that.elements["stage_endlocation_website"].value;
    newobject.values.description = that.elements["stage_description"].value;

    var wrapper = {}, wrapper2 = {};
    // Generate Route if this is first creation
    if (method === 'PUT') {
        wrapper.latLng = new L.latLng(newobject.values.startLocation.coords.x, newobject.values.startLocation.coords.y);
        wrapper2.latLng = new L.latLng(newobject.values.endLocation.coords.x, newobject.values.endLocation.coords.y);
    }

    // Manage multiple Pictures ?
    newobject.values.pictures = that.elements["stage_pictures"].value;
    if (method === 'PUT') {
        newobject.values.parking = [];
    }

    // Throw into Router to get initial Route
    console.log(newobject.values.route === undefined);
    if (newobject.values.route === undefined) {
        var router = L.routing.osrmv1();
        router.route([wrapper, wrapper2], function (err, routes) {
            if (err) {
                //TODO: handle error
            } else {
                console.log(routes[0]);
                newobject.values.route = {};
                newobject.values.route.coordinates = routes[0].coordinates;
                newobject.values.route.waypoints = routes[0].waypoints;
                save_object_in_db(newobject, method, '/api/' + newobject.id);
                console.log("im hereeeeererr");
            }
        });
    } else {
        save_object_in_db(newobject, method, '/api/' + newobject.id)
    }

    // Add Object to Element
    loaded_objects_visible.push(newobject);
    // Save in Database
    //save_object_in_db(newobject, method , '/api/' + newobject.id);
    return false;
}


$(document).ready(function() {
    // save_object_in_db(demoitems[0], 'PUT', '/api/' + demoitems[0].id);
    get_objects_by_id(loaded_object_id);
    // Overwrite default form Handlers.
    // overwrite submit handler for form used to save to Database
    $('#createObjectForm').submit(function(e) {
        e.preventDefault();
        var that = this;
        // Check that assoc is valid
        // Find Element
        var loaded_objects = loaded_objects_visible.concat(loaded_objects_invisible);
        var assoc_stage = that.elements["assoc_stage"].value;
        // connecting object with stage
        var result = $.grep(loaded_objects, function(e){ return e.id === assoc_stage; });
        if (result.length !== 1) {
            alert("Invalid assoc_element");
            return false;
        } else {
            var newobject = {
                "id": that.elements["object_id"].value,
                "type": that.elements["object_type"].value,
                "name": that.elements["object_name"].value,
                "price": that.elements["object_price"].value,
                "capacity": that.elements["object_capacity"].value
            };
            // Add Object to Element
            result[0].values.parking.push(newobject);
            // Save in Database
            save_object_in_db(result[0], 'POST', '/api/' + result[0].id);
        }
        return false;
    });
    $('#createStageForm').submit(function(e) {
        return submit_StageForm(e, this, 'PUT');
    });
    search_items("");
});

/**
 * Saves Objects to DB.
 */
function save_object_in_db(object, method, url) {
    $.ajax({
        data: JSON.stringify(object),
        type: method,
        contentType: 'application/json',
        dataType : "text",
        url:  url,
        error: function(xhr, status, err) {
            alert("Unable to store Object to Database. Error was: " + err + xhr.responseText)
        },
        success: function(res) {
            console.log("Parsed object" + object +"to Database.");
        }
    });
}

/**
 * Searches through the loaded Objects for matches and displays them
 * //TODO: Add more criteria (Parkplätze etc.)
 * @param searchterm
 */
function search_items(searchterm) {
    // Remove Objects that matched before
    var loaded_objects_visible_new = [];
    var loaded_objects_invisible_new = [];

    for (var i = 0, n = this.loaded_objects_visible.length; i < n; i++) {
        item = this.loaded_objects_visible[i];

        if(!(item.values.name.toLocaleLowerCase().includes(searchterm.toLocaleLowerCase())
            || item.values.startLocation.name.includes(searchterm)
            || item.values.endDate.includes(searchterm)
            || item.values.startDate.includes(searchterm)
            || item.values.endLocation.name.includes(searchterm))){
            // Remove from view
            $("#panel_" + item.id).remove();

            for (var i = 0, n = item.values.parking.length; i<n;i++){
                $("#panel_" + item.values.parking[i].id).remove();
            }
            // Write to correct array
            loaded_objects_invisible_new.push(item);
        } else {
            loaded_objects_visible_new.push(item);
        }
    };
    // Add new matching Objects
    for (var i = 0, n = this.loaded_objects_invisible.length; i < n; i++) {
        item = this.loaded_objects_invisible[i];
        if(item.values.name.toLocaleLowerCase().includes(searchterm.toLocaleLowerCase())
            || item.values.startLocation.name.includes(searchterm)
            || item.values.endDate.includes(searchterm)
            || item.values.startDate.includes(searchterm)
            || item.values.endLocation.name.includes(searchterm)){
            // Add to view
            add_to_accordion([item]);
            // Write to correct array
            loaded_objects_visible_new.push(item);
        } else {
            loaded_objects_invisible_new.push(item);
        }
    };
    loaded_objects_visible = loaded_objects_visible_new;
    loaded_objects_invisible = loaded_objects_invisible_new;
}

/**
 * Add Items to Search Results
 */
function add_to_accordion(items){
    for (var l = 0, m = items.length;l<m;l++) {
        var item = items[l];
        // inspired by http://jsfiddle.net/onigetoc/6dunsd01/
        var $itemPanel = $("#templatestage").clone();
        $itemPanel.removeClass("hidden").attr("id", "panel_" + item.id);
        $itemPanel.find(".accordion-toggle").attr("href", "#panel_collapse" + item.id)
            .append(item.values.type + " | " + item.values.name);
        $itemPanel.find(".btn-info").attr("id", "panel_editbutton_" + item.id);
        $itemPanel.find(".btn-danger").attr("id", "panel_deletebutton_" + item.id);
        $itemPanel.find(".panel-collapse").attr("id", "panel_collapse" + item.id).addClass("collapse").removeClass("in");
        createStagePanel($itemPanel.find(".panel-body"), item);
        $("#accordion").append($itemPanel);

        // Add associated Objects
        for (var i = 0, n = item.values.parking.length; i < n; i++) {
            var $itemPanel = $("#templateobject").clone();
            $itemPanel.removeClass("hidden").attr("id", "panel_" + item.values.parking[i].id);
            $itemPanel.find(".accordion-toggle").attr("href", "#panel_collapse" + item.values.parking[i].id)
                .text(item.values.parking[i].type + " - " + item.values.name + " | " + item.values.parking[i].name);
            $itemPanel.find(".btn-info").attr("id", "panel_editbutton_" + item.id);
            $itemPanel.find(".btn-danger").attr("id", "panel_deletebutton_" + item.id);
            $itemPanel.find(".panel-collapse").attr("id", "panel_collapse" + item.values.parking[i].id).addClass("collapse").removeClass("in");
            createObjectPanel($itemPanel.find(".panel-body"), item.values.parking[i]);
            $("#accordion").append($itemPanel);
        }
    }
    get_wikipedia_intro(items);
}

/**
 * Creates nice looking Panel for Accordion visualizing Stage
 * @param panel Object to append to
 * @param item Stage to visualize
 */
function createStagePanel(panel, item){
    var contentDiv = document.createElement('div');
    contentDiv.className = 'col-md-7';
    var pictureDiv = document.createElement('div');
    pictureDiv.className = 'col-md-5 scroll pill-right';

    // Correction for malformed Data (cause we use mongo and not relational DB):
    if (item.values.description === undefined){
        item.values.description = "";
    }
    if (item.values.pictures === undefined){
        item.values.pictures = [];
    }

    contentDiv.innerHTML  = "<h5><strong> Date: </strong>"
        + item.values.startDate
        + " - "
        + item.values.endDate
        + "</h5><br><h5><strong> Start: </strong>"
        + item.values.startLocation.name
        + " (Coordinates: "
        + item.values.startLocation.coords.x
        + ","
        + item.values.startLocation.coords.y
        + ") </h5><div class='lightgray' id='startlocation_" + item.id+ "'></div><br>"
        + "<h5><strong> Finish: </strong>"
        + item.values.endLocation.name
        + " (Coordinates: "
        + item.values.endLocation.coords.x
        + ","
        + item.values.endLocation.coords.y
        + ")</h5><div class='lightgray' id='endlocation_" + item.id+ "'></div><br>"
        + "<h5><strong> Description: </strong></h5>"
        + item.values.description
        + "<br>";

    for(var x = 0, n = item.values.pictures.length; x < n; x++){
        var picture = document.createElement('div');
        picture.className = 'row';
        picture.innerHTML += "<img class='img-fluid' src="+ item.values.pictures[x] +" alt=" + item.values.name + ">";
        pictureDiv.appendChild(picture);
    }
    panel.append(contentDiv,pictureDiv);
}

/**
 * Creates nice looking Panel for Accordion visualizing Object
 * @param panel Object to append to
 * @param item Object to visualize
 */
function createObjectPanel(panel, item){
    panel.append("<h5><strong> Name: </strong>"
        + item.name
        + "</h5>"
    );
    panel.append("<h5><strong> Price: </strong>"
        + item.price
        + "</h5>"
    );
    panel.append("<h5><strong> Capacity: </strong>"
        + item.capacity
        + "</h5>"
    );
}

function loadExternalGEOJSONTextField(){
    var json = $('#loadGeoJSONTextField').val();
    save_object_in_db(json, 'PUT', '/api/' + json.id);
}

function loadExternalFile(){
    $.get(document.getElementById('externalfile').value, function(response) {
        save_object_in_db(response, 'PUT', '/api/' + response.id);
    });
}

/**
 * Pane Switcher
 */
function toggleView(mode) {
    switch (mode) {
        case 'start':
            $('#start').removeClass('hidden');
            $('#menuitem_map').addClass('hidden');
            $('#search').addClass('hidden');
            $('#import').addClass('hidden');
            $('#imprint').addClass('hidden');
            $('#li_start').addClass('active');
            $('#li_map').removeClass('active');
            $('#li_search').removeClass('active');
            $('#li_import').removeClass('active');
            $('#li_imprint').removeClass('active');
            break;
        case 'map':
            $('#start').addClass('hidden');
            $('#menuitem_map').removeClass('hidden');
            $('#search').addClass('hidden');
            $('#import').addClass('hidden');
            $('#imprint').addClass('hidden');
            $('#li_start').removeClass('active');
            $('#li_map').addClass('active');
            $('#li_search').removeClass('active');
            $('#li_import').removeClass('active');
            $('#li_imprint').removeClass('active');
            map.remove();
            initMap();
            break;
        case 'search':
            $('#start').addClass('hidden');
            $('#menuitem_map').addClass('hidden');
            $('#search').removeClass('hidden');
            $('#import').addClass('hidden');
            $('#imprint').addClass('hidden');
            $('#li_start').removeClass('active');
            $('#li_map').removeClass('active');
            $('#li_search').addClass('active');
            $('#li_import').removeClass('active');
            $('#li_imprint').removeClass('active');
            break;
        case 'import':
            $('#start').addClass('hidden');
            $('#menuitem_map').addClass('hidden');
            $('#search').addClass('hidden');
            $('#import').removeClass('hidden');
            $('#imprint').addClass('hidden');
            $('#li_start').removeClass('active');
            $('#li_map').removeClass('active');
            $('#li_import').addClass('active');
            $('#li_search').removeClass('active');
            $('#li_imprint').removeClass('active');
            break;
        case 'imprint':
            $('#start').addClass('hidden');
            $('#menuitem_map').addClass('hidden');
            $('#search').addClass('hidden');
            $('#import').addClass('hidden');
            $('#imprint').removeClass('hidden');
            $('#li_start').removeClass('active');
            $('#li_map').removeClass('active');
            $('#li_search').removeClass('active');
            $('#li_import').removeClass('active');
            $('#li_imprint').addClass('active');
            break;
        default:
            // This shouldn't happen?
            console.log("Why am I in Mode " + mode + ". I am not supposed to be here!");
            break;
    }
}