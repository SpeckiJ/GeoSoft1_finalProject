/**
 * Geosoftware I, SoSe 2017, final
 * @author Jan Speckamp (428367)
 */

var assert;
var request;
var expect;
var testobject;
describe('Testsuite', function() {
    //loads modules
    before(function () {
        assert = require('assert');
        request = require("request");
        expect = require("chai").expect;
    });
    after(function () {
    });

    describe("Backend Test", function() {
        before(function () {
            testobject = JSON.stringify({
                "id": "6",
                "values": {
                    "route": {},
                    "name": "6",
                    "startDate": "6",
                    "endDate": "6",
                    "website": "",
                    "startLocation": {
                        "name": "6",
                        "image": "dummy123"
                    },
                    "endLocation": {
                        "name": "9",
                        "image": "dummy123"
                    },
                    "description": "6",
                    "pictures": [],
                    "parking": [
                        {
                            "name": "dfsafd",
                            "type": "Misc",
                            "coords": {
                                "x": 42.17968819665963,
                                "y": -2.2412109375000004
                            },
                            "capacity": "-9999",
                            "price": "-9999",
                            "description": "",
                            "picture": "11"
                        }
                    ]
                }

            });
        });
        var apiUrl = "http://localhost:3000/api/";

        it("Returns 200 without content", function (done) {
            request(apiUrl, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body).to.be.empty;
                done();
            });
        });

        it("Returns 500, unable to get Object", function (done) {
            request(apiUrl + "öäö", function (error, response, body) {
                expect(response.statusCode).to.equal(500);
                expect(body).to.equal("Failed to retrieve Object from Database.Error: Object not found in Database");
                done();
            });
        });

        it("Returns 422 for invalid schema", function (done) {
            request.put({
                url: apiUrl + 'test2',
                body: "kk"
            }, function (error, response, body) {
                expect(response.statusCode).to.equal(422);
                done();
            });
        });

        it("Returns 200, successfully saved", function (done) {
            request.put({
                headers: {'content-type': 'application/json'},
                url: apiUrl + 'test',
                body: testobject
            }, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body).to.equal("Successfully wrote Objects to Database");
                done();
            });
        });

        it("Returns 200, successfully saved via PUT", function (done) {
            request.put({
                headers: {'content-type': 'application/json'},
                url: apiUrl + 'test',
                body: testobject
            }, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body).to.equal("Successfully wrote Objects to Database");
            });
        });

        it("Returns 200, successfully saved via POST", function (done) {
            request.post({
                headers: {'content-type': 'application/json'},
                url: apiUrl + 'test',
                body: testobject
            }, function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body).to.equal("Successfully wrote Objects to Database");
            });
        });


        it("Returns 200, successfully deleted ", function (done) {
            request.del(apiUrl + "test", function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(body).to.equal("Successfully deleted Object from Database");
                done();
            });
        });
    });
});
