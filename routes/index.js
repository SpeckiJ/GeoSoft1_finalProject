'use strict';

var express = require('express');
var router = new express.Router();
var db = require('../lib/DBHandler.js');
var validator = require('../lib/stageschema.js');


/* GET Page. */
router.get('/', function(req, res, next) {
    db.get_all_item_ids(
        function(idlist){
            var idlist_refined  ="";
            for (var i = 0; i < idlist.length; i++) {
                idlist_refined += idlist[i].id+ ",";
            }
            idlist_refined = idlist_refined.substr(0, idlist_refined.length-1);
            res.render('index', {objects: idlist_refined});
        }
    );
});

router.get('/api/', function (req, res, next) {
    res.status(200).end("");
});

router.route('/api/:id')
    // GET Object from Database
    .get(function (req, res) {
        db.get_item(req.params.id, function(err, object){
            if (err) {
                res.status(500).end("Failed to retrieve Object from Database." + err);
            } else {
                res.send(object);
            }
        });
    })
    // DELETE Object from Database
    .delete(function (req, res) {
        db.delete_item(req.params.id, function(err){
            if (err)
                res.status(500).end("Failed to delete Object from Database. " + err);
            else
                res.status(200).end("Successfully deleted Object from Database");
        })
    })
    // POST Object in Database (Change Object)
    .post(function (req, res) {
        res.setHeader('Content-type', 'application/json');
        if(!validator.validatejson(req.body).valid) {
            var validation = validator.validatejson(req.body);
            console.log("Validation failed due to Errors:" + validation);
            res.status(422).end("GeoJSON Validation failed with Error:" + validation);
        } else {
            db.change_item(req.body, function (err) {
                if (err)
                    res.status(500).end("Failed to change Object in Database." + err);
                else
                    res.status(200).end("Successfully changed Object in Database");
            });
        }
    })
    // PUT Object in Database
    .put(function (req, res) {
        // Validate if JSON was valid stage
        res.setHeader('Content-type', 'application/json');
        if(!validator.validatejson(req.body).valid){
            var validation = validator.validatejson(req.body);
            console.log("Validation failed due to Errors:" + validation);
            res.status(422).end("GeoJSON Validation failed with Error:" + validation);
        } else {
            db.insert_item(req.body, function (err) {
                if (err)
                    res.status(500).end("Failed to write Objects to Database." + err);
                else
                    res.status(200).end("Successfully wrote Objects to Database");
            });
        }
    });

module.exports = router;
