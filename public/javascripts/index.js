
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


/**
 * Gets Objects from API
 */
function get_objects_by_id(idlist) {
    idlist.forEach(function (t) {
        // submit via ajax
        $.ajax({
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
            url:  '/api/'+t.id,
            error: function(xhr, status, err) {
                //TODO
                console.log(err);
            },
            success: function(res) {
                loaded_objects_invisible.push(res[0]);
            }
        }).then(function () {
                search_items("");
        });
    });
}


/**
 * Gets Content from Wikipedia
 */
function get_wikipedia_intro(idlist) {
    idlist.forEach(function (t) {
        // submit via ajax
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
    });
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
                    "waypoints":
                        [
                        ],
                    "description": "Beschreibung der Etappe 1",
                    "pictures": [
                        "http://www.reise-nach-italien.de/pisa01.jpg",
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwBTNi5EWtu3VUspEzbPPSH4meDSRY_gfGM0hjBsuX8G2V5AjfU6f5_Q"
                    ],
                    "parking": [
                        {
                            "id": "parking1",
                            "type": "Parking",
                            "name": "Parkplatz1",
                            "price": 555,
                            "capacity": 2323,
                        },
                        {
                            "id": "parking2",
                            "type": "Parking",
                            "name": "Parkplatz2",
                            "price": 222,
                            "capacity": 1111,
                        },

                    ],
                }
        }
    ];


$(document).ready(function() {
    get_objects_by_id(demoitems);
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
        e.preventDefault();
        var that = this;

        //TODO: Assert correctness of User Input

        // Create Object
        var newobject =
        {
            "id": that.elements["stage_id"].value,
            "values": {
            "name": that.elements["stage_name"].value,
                "type": that.elements["stage_type"].value,
                "startDate":that.elements["stage_startDate"].value,
                "endDate":that.elements["stage_endDate"].value,
                "startLocation":
            {
                "coords": {
                    "x":that.elements["stage_startlocation_coords"].value.split(',')[0],
                    "y":that.elements["stage_startlocation_coords"].value.split(',')[1]
                },
                "name":that.elements["stage_startlocation_name"].value,
                "image":that.elements["stage_startlocation_image"].value,
                "website":that.elements["stage_startlocation_website"].value,
            },
            "endLocation":
            {
                "coords": {
                    "x":that.elements["stage_endlocation_coords"].value.split(',')[0],
                    "y":that.elements["stage_endlocation_coords"].value.split(',')[1]
                },
                "name":that.elements["stage_endlocation_name"].value,
                "image":that.elements["stage_endlocation_image"].value,
                "website":that.elements["stage_endlocation_website"].value,
            },
            "waypoints":
            [
                that.elements["stage_waypoints"].value
            ],
            "description": that.elements["stage_description"].value,
            "pictures": [
                that.elements["stage_pictures"].value
            ],
            }
        };

        // Add Object to Element
        loaded_objects_visible.push(newobject)
        // Save in Database
        save_object_in_db(newobject, 'PUT', '/api/' + newobject.id);
        return false;
    });
});

/**
 * Saves Objects to DB.
 */
function save_object_in_db(object, method, url) {
    $.ajax({
        data: JSON.stringify(object),
        type: method,
        contentType: 'application/json',
        dataType : "json",
        url:  url,
        error: function(xhr, status, err) {
            //TODO
        },
        success: function(res) {
            console.log("Parsed object" + object +"to Database 1");
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
    items.forEach(
        function (item) {
            // inspired by http://jsfiddle.net/onigetoc/6dunsd01/
            var $itemPanel = $("#template").clone();
            $itemPanel.removeClass("hidden").attr("id", "panel_" + item.id);
            $itemPanel.find(".accordion-toggle").attr("href",  "#panel_collapse" + item.id)
                .text(item.values.type + " | " + item.values.name);
            $itemPanel.find(".panel-collapse").attr("id", "panel_collapse" + item.id).addClass("collapse").removeClass("in");
            createStagePanel($itemPanel.find(".panel-body"), item);
            $("#accordion").append($itemPanel);

            // Add associated Objects
            for (var i = 0, n = item.values.parking.length;i<n;i++) {
                var $itemPanel = $("#template").clone();
                $itemPanel.removeClass("hidden").attr("id", "panel_" + item.values.parking[i].id);
                $itemPanel.find(".accordion-toggle").attr("href",  "#panel_collapse" + item.values.parking[i].id)
                    .text(item.values.parking[i].type +" - "+ item.values.name +" | " + item.values.parking[i].name);
                $itemPanel.find(".panel-collapse").attr("id", "panel_collapse" + item.values.parking[i].id).addClass("collapse").removeClass("in");
                createObjectPanel($itemPanel.find(".panel-body"), item.values.parking[i]);
                $("#accordion").append($itemPanel);
            }
        }
    );
    get_wikipedia_intro(items);
}

/**
 * Creates nice looking Panel for Accordion visualizing Stage
 * @param panel Object to append to
 * @param item Stage to visualize
 */
function createStagePanel(panel, item){
    panel.append("<h5><strong> Date: </strong>"
        + item.values.startDate
        + " - "
        + item.values.endDate
        + "</h5><br>"
    );
    for(var x = 0, n = item.values.pictures.length; x < n; x++){
        panel.append("<img class='floatright' src="+ item.values.pictures[x] +" alt=" + item.values.name + ">")
    }
    panel.append("<h5><strong> Start: </strong>"
        + item.values.startLocation.name
        + " (Coordinates: "
        + item.values.startLocation.coords.x
        + ","
        + item.values.startLocation.coords.y
        + ") </h5><div class='lightgray' id='startlocation" + "_" + item.id+ "'></div><br>"
    );
    panel.append("<h5><strong> Finish: </strong>"
        + item.values.endLocation.name
        + " (Coordinates: "
        + item.values.endLocation.coords.x
        + ","
        + item.values.endLocation.coords.y
        + ")</h5><div class='lightgray' id='endlocation" + "_" + item.id+ "'></div><br>"
    );
    panel.append("<h5><strong> Description: </strong></h5>"
        + item.values.description
        + "<br>"
    );
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

/**
 * Pane Switcher
 */
function toggleView(mode) {
    switch (mode) {
        case 'start':
            $('#start').removeClass('hidden');
            $('#menuitem_map').addClass('hidden');
            $('#search').addClass('hidden');
            $('#imprint').addClass('hidden');
            $('#li_start').addClass('active');
            $('#li_map').removeClass('active');
            $('#li_search').removeClass('active');
            $('#li_imprint').removeClass('active');
            break;
        case 'map':
            $('#start').addClass('hidden');
            $('#menuitem_map').removeClass('hidden');
            $('#search').addClass('hidden');
            $('#imprint').addClass('hidden');
            $('#li_start').removeClass('active');
            $('#li_map').addClass('active');
            $('#li_search').removeClass('active');
            $('#li_imprint').removeClass('active');
            break;
        case 'search':
            $('#start').addClass('hidden');
            $('#menuitem_map').addClass('hidden');
            $('#search').removeClass('hidden');
            $('#imprint').addClass('hidden');
            $('#li_start').removeClass('active');
            $('#li_map').removeClass('active');
            $('#li_search').addClass('active');
            $('#li_imprint').removeClass('active');
            break;
        case 'imprint':
            $('#start').addClass('hidden');
            $('#menuitem_map').addClass('hidden');
            $('#search').addClass('hidden');
            $('#imprint').removeClass('hidden');
            $('#li_start').removeClass('active');
            $('#li_map').removeClass('active');
            $('#li_search').removeClass('active');
            $('#li_imprint').addClass('active');
            break;
        default:
            // This shouldn't happen?
            console.log("Why am I in Mode " + mode + ". I am not supposed to be here!");
            break;
    }
}