
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
                        "type",
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
                        "type": {
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
                                "coords",
                                "name"
                            ],
                            "properties": {
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
                        "waypoints": {
                            "type": "array"
                        },
                        "description": {
                            "type": "string"
                        },
                        "pictures": {
                            "type": "string"
                        },
                        "parking": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "additionalProperties": false,
                                "required": [
                                    "id",
                                    "type",
                                    "coords"
                                ],
                                "properties": {
                                    "id": {
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
                                    "name": {
                                        "type": "string"
                                    },
                                    "price": {
                                        "type": "number"
                                    },
                                    "capacity": {
                                        "type": "number"
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
