/**
 * Geosoftware I, SoSe 2017, final
 * @author Jan Speckamp (428367)
 */

var loaded_objects_visible = [];
var loaded_objects_invisible = [];
var startlocation_wikipedia;
var endlocation_wikipedia;
var stopsearch = false;

/** 
* Replace Information Panel with Form Panel to start editing the Stage.
*/
function edit_stage(button){
    $('.panel-collapse.in').collapse('hide');
    // Timeout to wait for fading Animation
    setTimeout(function() {
        // Prepare Panel
        var panel = $("#panel_" + button.id.substr(17)).find(".panel-collapse");
        panel.collapse('show');
        var template = $("#createStageForm").clone();
        panel = panel.find(".panel-body").empty();
        panel.append(template);

        // Get Actual Item to be edited
        var object;
        var collection = loaded_objects_visible.concat(loaded_objects_invisible);
        for (var i = 0, n = collection.length; i < n; i++) {
            if (collection[i].id === button.id.substr(17)) {
                object = collection[i];
            }
        }
        // Fill Form with values
        panel.find("#stage_id")[0].value = object.id;
        panel.find("#stage_id").addClass("readonly");
        panel.find("#stage_name")[0].value = object.values.name;
        panel.find("#stage_startDate")[0].value = object.values.startDate;
        panel.find("#stage_endDate")[0].value = object.values.endDate;
        panel.find("#stage_startlocation_name")[0].value = object.values.startLocation.name;
        panel.find("#stage_startlocation_image")[0].value = object.values.startLocation.image;
        panel.find("#stage_endlocation_name")[0].value = object.values.endLocation.name;
        panel.find("#stage_endlocation_image")[0].value = object.values.endLocation.image;
        panel.find("#stage_description")[0].value = object.values.description;
        panel.find("#stage_website")[0].value = object.values.website;
        var wp = object.values.route.waypoints;
        panel.find("#stage_startlocation_coords")[0].value = wp[0].latLng.lat + "," + wp[0].latLng.lng;
        panel.find("#stage_endlocation_coords")[0].value = wp[wp.length-1].latLng.lat + "," + wp[wp.length-1].latLng.lng;
        panel.find("#stage_route")[0].value = JSON.stringify(object.values.route);
        panel.find("#stage_parking")[0].value = JSON.stringify(object.values.parking);

        for (var m = 0; m < object.values.pictures.length; m++) {
            console.log(object.values.pictures[m]);
            $(".input-fields-wrap").append('<div><input type="text" id="stage_pictures[]" value=' + object.values.pictures[m]+ '><a href="#" class="remove_field"><i class="fa fa-trash-o"></i></a></div>');
        }

        // Dynamic Picture Input Fields
        $('.add-field-button').on('click', function(e){
            e.preventDefault();
            $(".input-fields-wrap").append('<div><input type="text" id="stage_pictures[]"/><a href="#" class="remove_field"><i class="fa fa-trash-o"></i></a></div>');
        });
        $('.input-fields-wrap').on("click",".remove_field", function(e){
            e.preventDefault();
            $(this).parent().remove();
        });

        // Custom readonly for Input fields
        $(".readonly").on('keydown paste', function(e){
            e.preventDefault();
        });

        // Overwrite Form Submit Handler
        template.submit(function (e) {
            var panel = $("#panel_" + button.id.substr(17)).find(".panel-collapse");
            createStagePanel(panel, object);
            return submit_StageForm(e, this, 'POST');
        });
        panel.collapse('show');
    }, 800);
}
/** 
 * Delete Stage and reload Page to update it 
 */
function delete_stage(button) {
    $.ajax({
        url: '/api/' + button.id.substr(19),
        type: 'DELETE',
        success: function(result) {
            location.reload();
            console.log("Successfully deleted Stage");
        }
    });
}

/**
 * Initializes the Map Object and loads all routes from supplied list of ids
 */
function initMapwithRoutes(idlist){
    initMap();
    get_stages_and_visualize(idlist);
}

/**
 * Gets Stage with given id from Server and visualizes it. If Stage is already visualized the visualization is updated
 */
function duplicateSafe_get_stages_and_visualize(id) {
    var j,l;
    for (var i = 0; i < loaded_objects_invisible.length; i++) {
        if (loaded_objects_invisible[i].id === id) {
            j = i;
            break;
        }
    }
    for (var m = 0; m < loaded_objects_visible.length; m++) {
        if (loaded_objects_visible[m].id === id) {
            l = m;
            break;
        }
    }
    if (j !== undefined) {
        loaded_objects_invisible.splice(i, 1);
    } else {
        loaded_objects_visible.splice(m, 1);
    }
    // Deleted old Visualization and now getting new one
    get_stages_and_visualize([id]);
}

/**
 * Get Stages with given ids and visualizes them.
 */
function get_stages_and_visualize(idlist) {
    for (var i = 0 , n = idlist.length; i<n; i++) {
        // submit via ajax
        $.ajax({
            // catch custom response code.
            statusCode: {
                500: function () {
                    //ERROR on server-side;
                    console.error("Object not found");
                }
            },
            data: '',
            type: 'GET',
            contentType: "application/json",
            // Dynamically create Request URL by appending requested name to /api prefix
            url: '/api/' + idlist[i],
            error: function (xhr, status, err) {
                console.log(err);
            },
            success: function (res) {
                loaded_objects_invisible.push(res[0]);
                addStagesToMap([res[0]]);
                search_items();
            }
        });
    }
}

/**
 * Gets Content from Wikipedia for given list of object ids.
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
            document.getElementById('startlocation_' + t.id).innerHTML = "Wikipedia <a href='https://en.wikipedia.org/w/api.php?format=json&origin=*&action=query&prop=extracts&redirects=1&exintro=&explaintext=&titles=" + t.values.startLocation.name+ "'>(source)</a>: <br>" + startlocation_wikipedia;
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
            document.getElementById('endlocation_' + t.id).innerHTML = "Wikipedia <a href='https://en.wikipedia.org/w/api.php?format=json&origin=*&action=query&prop=extracts&redirects=1&exintro=&explaintext=&titles=" + t.values.endLocation.name+ "'>(source)</a>: <br>" + endlocation_wikipedia;
        });
    };
}

/**
 * Custom Submit Handler for Stage Submission. 
 */
var newobject;
function submit_StageForm(e, that, method){
    e.preventDefault();
    // Create Object
    newobject = {};
    newobject.id = that.elements["stage_id"].value;
    newobject.values = {};
    newobject.values.name = that.elements["stage_name"].value;
    newobject.values.startDate = that.elements["stage_startDate"].value;
    newobject.values.endDate = that.elements["stage_endDate"].value;
    newobject.values.website = that.elements["stage_website"].value;
    newobject.values.startLocation = {};
    newobject.values.startLocation.name = that.elements["stage_startlocation_name"].value;
    newobject.values.startLocation.image = that.elements["stage_startlocation_image"].value;
    newobject.values.endLocation = {};
    newobject.values.endLocation.name = that.elements["stage_endlocation_name"].value;
    newobject.values.endLocation.image = that.elements["stage_endlocation_image"].value;
    newobject.values.description = that.elements["stage_description"].value;

    // Get Picture Links from all Input fields
    newobject.values.pictures = [];
    if (that.elements["stage_pictures[]"] !== undefined) {
        for (var i = 0; i < (that.elements["stage_pictures[]"]).length; i++) {
            newobject.values.pictures.push(that.elements["stage_pictures[]"][i].value);
        }
    }
    // Parking can only be set if Object is already in DB.
    if (method === 'PUT') {
        newobject.values.parking = [];
    } else {
        newobject.values.parking = JSON.parse(that.elements["stage_parking"].value)
        console.log(newobject.values.parking);
    }
    // If Routing Machine is not currently active take presaved Route
    if (route !== undefined) {
        newobject.values.route = {};
        newobject.values.route.coordinates = route.coordinates;
        newobject.values.route.waypoints = route.waypoints;
    } else {
        newobject.values.route = JSON.parse(that.elements["stage_route"].value);
    }
    // Save in Database and Reload
    route_in_routeControl = false;
    save_stage_in_db(newobject, method, '/api/' + newobject.id);
    // Collapse Form
    $(".panel-collapse").collapse("hide");
    sidebar.open("home");
    removeTempMarkers();
    return false;
}

/**
 * Loads all requested Stages. Overwrites all Submit Handlers that are already present,
 */
$(document).ready(function() {
    // Special case for Mocha
    if(loaded_object_id !== undefined) {
        console.log("LOADING: " + loaded_object_id.toString());
        initMapwithRoutes(loaded_object_id);
    }
    // Overwrite Submit Form Handler to use AJAX
    $('#createStageForm').submit(function(e) {
        return submit_StageForm(e, this, 'PUT');
    });

    // Custom readonly for LatLng Input fields
    $(".readonly").on('keydown paste', function(e){
        e.preventDefault();
    });
    // Close Stage Creation when accordion is collapsed
    $('#accordion').on('show.bs.collapse', function () {
        routeControl.setWaypoints([]);
        stopsearch = true;
        if (route_in_editing !== undefined){
            duplicateSafe_get_stages_and_visualize(route_in_editing.id);
        }
        route_in_editing = undefined;
        removeTempMarkers();
        $("#createStageForm").trigger('reset');
    });
    // Show all Items when initially opening Search Bar
    sidebar.on('content', function(e) {
        if (e.id === "search") {
            search_items();
        }
    })
    // Dynamic Picture Input fields in Stage Creation Form
    $('.add-field-button').on('click', function(e){
        e.preventDefault();
        $(".input-fields-wrap").append('<div><input type="text" id="stage_pictures[]"/><a href="#" class="remove_field"><i class="fa fa-trash-o"></i></a></div>');
    });
    $('.input-fields-wrap').on("click",".remove_field", function(e){
        e.preventDefault();
        $(this).parent().remove();
    });
});

/**
 * Saves Objects to DB. If route_in_routecontrol is false Route is retrieved from Server and visualized after saving.
 */
function save_stage_in_db(object, method, url) {
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
            if (!route_in_routeControl) {
                duplicateSafe_get_stages_and_visualize(object.id);
                route_in_routeControl = false;
            }
            console.log("Parsed object with ID: '" + object.id +"' to Database.");
        }
    });
}

/**
 * Searches through the loaded Objects for matches and displays them
 * @param searchterm
 */
function search_items() {
    // Check if Search is to be done
    if (stopsearch){
        stopsearch = false;
        return null;
    }
    var searchterm = document.getElementById("searchform_input").value;
    var loaded_objects_visible_new = [];
    var loaded_objects_invisible_new = [];

    // Remove Objects that matched before
    for (var i = 0, n = this.loaded_objects_visible.length; i < n; i++) {
        item = this.loaded_objects_visible[i];
        if(!(item.values.name.toLocaleLowerCase().includes(searchterm.toLocaleLowerCase())
            || item.values.startLocation.name.includes(searchterm)
            || item.values.endDate.includes(searchterm)
            || item.values.startDate.includes(searchterm)))
        {
            // Remove from view
            console.log("Removing item with Id: '" + item.id + "' from List");
            $("#panel_" + item.id).remove();
            // Remove associated Objects
            for (var i = 0, n = item.values.parking.length; i<n;i++){
                $("#panel_" + item.values.parking[i].name).remove();
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
            // Delete old panel and associated Objects
            $("#panel_" + item.id).remove();
            for (var x = 0, y = item.values.parking.length; x<y;x++){
                $("#panel_" + item.values.parking[x].name).remove();
            }
            // Add new Panel to view
            add_to_accordion(item);
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
 * Add Items to Accordion List
 */
function add_to_accordion(item){
    // inspired by http://jsfiddle.net/onigetoc/6dunsd01/
    var $itemPanel = $("#templatestage").clone();
    $itemPanel.removeClass("hidden").attr("id", "panel_" + item.id);
    $itemPanel.find(".accordion-toggle").attr("href", "#panel_collapse" + item.id)
        .append(item.id + " | " + item.values.name);
    $itemPanel.find(".btn-info").attr("id", "panel_editbutton_" + item.id);
    $itemPanel.find(".btn-danger").attr("id", "panel_deletebutton_" + item.id);
    $itemPanel.find(".panel-collapse").attr("id", "panel_collapse" + item.id).addClass("collapse").removeClass("in");
    createStagePanel($itemPanel.find(".panel-body"), item);
    $("#accordion").append($itemPanel);

    // Add associated Objects
    for (var i = 0, n = item.values.parking.length; i < n; i++) {
        var $itemPanel = $("#templateobject").clone();
        $itemPanel.removeClass("hidden").attr("id", "panel_" + item.values.parking[i].name);
        $itemPanel.find(".accordion-toggle").attr("href", "#panel_collapse" + item.values.parking[i].name)
            .text(item.values.parking[i].type + " - " + item.values.name + " | " + item.values.parking[i].name);
        $itemPanel.find(".btn-info").attr("id", "panel_editbutton_" + item.id);
        $itemPanel.find(".btn-danger").attr("id", "panel_deletebutton_" + item.id);
        $itemPanel.find(".panel-collapse").attr("id", "panel_collapse" + item.values.parking[i].name).addClass("collapse").removeClass("in");
        createObjectPanel($itemPanel.find(".panel-body"), item.values.parking[i]);
        $("#accordion").append($itemPanel);
    }
    get_wikipedia_intro([item]);
}

/**
 * Creates nice looking Panel for Accordion visualizing Stage
 * @param panel Object to append to
 * @param item Stage to visualize
 */
function createStagePanel(panel, item){
    var contentDiv = document.createElement('div');
    contentDiv.className = 'col-md-12';

    // Correction for malformed Data (cause we use mongo and not relational DB):
    if (item.values.description === undefined){
        item.values.description = "No Description Provided";
    }
    if (item.values.pictures === undefined){
        item.values.pictures = [];
    }
    if(item.values.website === undefined) {
        item.values.website = "No Website Provided!"
    }
    if (item.values.startLocation.image === ""){
        item.values.startLocation.image = "dummy123"
    }
    if (item.values.endLocation.image === ""){
        item.values.endLocation.image = "dummy123"
    }

    contentDiv.innerHTML  = "<h5><strong> Date: </strong>"
        + item.values.startDate
        + " - "
        + item.values.endDate
        + "</h5><h5><strong> Start: </strong>"
        + item.values.startLocation.name
        + "</h5><div class='lightgray' id='startlocation_" + item.id+ "'></div><br>"
        + "<h5><strong>Picture of Startlocation:</strong></h5><img alt='No image provided' src='"
        + item.values.startLocation.image
        + "'/>"
        + "<h5><strong> Finish: </strong>"
        + item.values.endLocation.name
        + "</h5><div class='lightgray' id='endlocation_" + item.id+ "'></div><br>"
        + "<h5><strong>Picture of Endlocation:</strong></h5><img alt='No image provided' src='"
        + item.values.endLocation.image
        + "'/>"
        + "<h5><strohjng> Website: </strohjng></h5>"
        + item.values.website
        + "<h5><strong> Description: </strong></h5>"
        + item.values.description
        + "<br><h5><strong> Pictures: </strong></h5>";

    for(var x = 0, n = item.values.pictures.length; x < n; x++){
        var picture = document.createElement('div');
        picture.className = 'row';
        console.log("Getting Pictures:");
        picture.innerHTML += "<img class='img-fluid' src="+ item.values.pictures[x] +" alt=" + item.values.name + ">";
        contentDiv.appendChild(picture);
    }
    panel.append(contentDiv);
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
    panel.append("<h5><strong> Type: </strong>"
        + item.type
        + "</h5>"
    );
    if (item.price !== "-9999") {
        panel.append("<h5><strong> Price: </strong>"
            + item.price
            + "</h5>"
        );
    }
    if (item.capacity !== "-9999") {
        panel.append("<h5><strong> Capacity: </strong>"
            + item.capacity
            + "</h5>"
        );
    }
    panel.append("<h5><strong> Description: </strong>"
        + item.description
        + "</h5>"
    );
    if (item.picture !== "-9999") {
        panel.append("<h5><strong> Picture: </strong></h5>"
            + "<img src='" + item.picture + "'>"
        );
    }
}

/**
 * Loads JSON from Textfield and saves it to the DB. After Saving it is downloaded and visualized.
 */
function loadExternalGEOJSONTextField(){
    var json = $('#loadGeoJSONTextField').val();
    save_stage_in_db(JSON.parse(json), 'PUT', '/api/' + JSON.parse(json).id);
}

/**
 * Loads Json from File and saves it to the DB. After Saving it is downloaded and visualized.
 */
function loadExternalFile(){
    $.get(document.getElementById('externalfile').value, function(response) {
        save_stage_in_db(JSON.parse(response), 'PUT', '/api/' + JSON.parse(response.id));
    });
}