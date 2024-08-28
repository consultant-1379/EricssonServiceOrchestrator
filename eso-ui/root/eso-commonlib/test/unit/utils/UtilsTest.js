/**
 * *******************************************************************************
 * COPYRIGHT Ericsson 2017
 *
 * The copyright to the computer program(s) herein is the property of
 * Ericsson Inc. The programs may be used and/or copied only with written
 * permission from Ericsson Inc. or in accordance with the terms and
 * conditions stipulated in the agreement/contract under which the
 * program(s) have been supplied.
 *******************************************************************************
 * User: eeicmsy
 * Date: 24/11/17
 */
define([
    "eso-commonlib/Utils"
], function (Utils) {
    'use strict';

    var sandbox;

    describe('Utils Test', function () {

        beforeEach(function () {
            sandbox = sinon.sandbox.create();

        });

        afterEach(function () {

            sandbox.restore();

        });

        it("should be defined", function () {
            expect(Utils).to.be.defined;
        });

        describe('log() should log as expected', function () {

            it("Should call console.log with message", function () {
                Utils.ISDEBUGGING = true;
                sandbox.stub(console, "log");

                var response = {
                    getResponseText : function(){
                        return "error happened";
                    }
                }

                Utils.log("message", response);
                expect(console.log.getCall(0).calledWith("message, Reason: error happened")).to.equal(true);
            });

        });

        describe('mergeObjects() should merge objects', function () {

            it("Should merge two json objects", function () {
                var obj1 = {"title": "hello"};

                var obj2 = {
                    "CLEAR_ALL": "Clear all",
                    "NO": "No"
                };


                var expectedResult = {
                    "title": "hello",
                    "CLEAR_ALL": "Clear all",
                    "NO": "No"
                }

                var result = Utils.mergeObjects(obj1, obj2);

                expect(expectedResult).to.deep.equal(result);
            });

        });

    });
});





