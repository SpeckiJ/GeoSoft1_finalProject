/**
 * Geosoftware I, SoSe 2017, final
 * @author Jan Speckamp (428367)
 */

exports.validatejson = function(json) {
    var Validator = require('jsonschema').Validator;
    var schema =
        {
            "$schema": "http://json-schema.org/draft-04/schema#",
            "id": "http://asdfasdfasdf",
            "type": "object",
            "additionalProperties": false,
            "required": [
                "id",
                "values"
            ],
            "properties": {
                "_id": {
                    "type": "string"
                },
                "id": {
                    "type": "string"
                },
                "values": {
                    "type": "object",
                    "additionalProperties": false,
                    "required": [
                        "name",
                        "startDate",
                        "endDate",
                        "route",
                        "startLocation",
                        "endLocation"
                    ],
                    "properties": {
                        "name": {
                            "type": "string"
                        },
                        "startDate": {
                            "type": "string"
                        },
                        "endDate": {
                            "type": "string"
                        },
                        "route": {
                            "type": "object"
                        },
                        "startLocation": {
                            "type": "object",
                            "additionalProperties": false,
                            "required": [
                                "name"
                            ],
                            "properties": {
                                "name": {
                                    "type": "string"
                                },
                                "image": {
                                    "type": "string"
                                },
                                "website": {
                                    "type": "string"
                                }
                            }
                        },
                        "endLocation": {
                            "type": "object",
                            "additionalProperties": false,
                            "properties": {
                                "name": {
                                    "type": "string"
                                },
                                "image": {
                                    "type": "string"
                                },
                                "website": {
                                    "type": "string"
                                }
                            }
                        },
                        "description": {
                            "type": "string"
                        },
                        "pictures": {
                            "type": "array",
                            "items": {
                                "type": 'string'
                            }
                        },
                        "website":{
                            "type": "string"
                        },
                        "parking": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "additionalProperties": false,
                                "required": [
                                    "name",
                                    "type",
                                    "coords",
                                    "price",
                                    "capacity"
                                ],
                                "properties": {
                                    "name": {
                                        "type": "string"
                                    },
                                    "type": {
                                        "type": "string"
                                    },
                                    "coords": {
                                        "type": "object",
                                        "additionalProperties": false,
                                        "required": [
                                            "x",
                                            "y"
                                        ],
                                        "properties": {
                                            "x": {
                                                "type": "number"
                                            },
                                            "y": {
                                                "type": "number"
                                            }
                                        }
                                    },
                                    "price": {
                                        "type": "string"
                                    },
                                    "capacity": {
                                        "type": "string"
                                    },
                                    "description": {
                                        "type": "string"
                                    },
                                    "picture": {
                                        "type": "string"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
    var v = new Validator();
    return(v.validate(json,schema));
};
