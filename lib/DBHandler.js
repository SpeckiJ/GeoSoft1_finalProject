'use strict';

var monk = require('monk');
var db = monk('127.0.0.1:27017/aufgabe_final');
var collection = db.get('objectcollection');

module.exports = {

    insert_item: function (item, callback) {
        //TODO: maybe not do this every time ?
        collection.ensureIndex( { "id": 1 }, { unique: true });
        // Submit to the DB
        collection.update(
            {id: { $eq: item.id }},{
                "id": item.id,
                "values": item.values
            },
            { upsert: true },
            function (err, doc) {
                if (err) {
                    callback(err);
                } else {
                    callback(null);
                }
            })
    },

    get_item: function(id, callback) {
        // Search for Element
        console.log(id);
        collection.find({id: { $eq: id }},{},function(err,object){
            // Check for connection/syntax errors
            if(err){
                callback(err,null);
            }else{
                // Check if there is an Entry - else fail
            if(object.length === 1){
                    // Entry is returned
                    callback(null, object);
                } else {
                    // No entry was found
                    callback(new Error("Object not found in Database"), null);
                }
            }
        });
    },
    change_item: function (item, callback) {
            collection.update(
                {id: { $eq: item.id }},
                {
                    "id": item.id,
                    "values": item.values
                }, function (err, doc) {
                    if (err) {
                        callback(err);
                    } else {
                        console.log(doc);
                        callback(null);
                    }
            })
    },
    delete_item: function (id, callback) {
        collection.remove({ id: id },
            function (err, doc) {
                if (err) {
                    callback(err);
                } else {
                    callback(null);
                }
            })
    }
};
