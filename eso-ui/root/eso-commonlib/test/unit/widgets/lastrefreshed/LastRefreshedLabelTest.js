/**
 * *******************************************************************************
 * COPYRIGHT Ericsson 2018
 *
 * The copyright to the computer program(s) herein is the property of
 * Ericsson Inc. The programs may be used and/or copied only with written
 * permission from Ericsson Inc. or in accordance with the terms and
 * conditions stipulated in the agreement/contract under which the
 * program(s) have been supplied.
 *******************************************************************************
 * User: eeicmsy
 * Date: 05/01/18
 */
define([
    "jscore/core",
    "eso-commonlib/LastRefreshedLabel"
], function (core, LastRefreshedLabel) {
    'use strict';

    var sandbox, lastRefreshedLabelTest;

    describe('Last Refreshed Label', function () {

        beforeEach(function () {

            lastRefreshedLabelTest = new LastRefreshedLabel();

            lastRefreshedLabelTest.secondsAlive = 60;

            sandbox = sinon.sandbox.create();

        });

        afterEach(function () {
            sandbox.restore();
            lastRefreshedLabelTest.handleHouseKeepingOnClose();
        });


        it("should not be undefined", function () {
            expect(LastRefreshedLabel).not.to.be.undefined;
        });

        describe("LastRefreshedLabel Tests", function () {


            describe('performAfterInitialWaitAction test methods', function () {


                it("should set up a timer  interval", function () {

                    lastRefreshedLabelTest.performAfterInitialWaitAction();

                    expect(lastRefreshedLabelTest.intervalTimer).not.to.be.undefined;

                });

            });


            describe('updateDisplayLabel test methods', function () {


                it("should display the expected text for random seconds", function () {

                    sandbox.stub(lastRefreshedLabelTest, 'getSecondsElapsedSinceStarted', function () {
                        return 8394837;
                    });

                    lastRefreshedLabelTest.updateDisplayLabel();

                    var expectedText = "Last refreshed 97 days 3 hours 53 minutes 57 seconds ago";

                    expect(expectedText).to.equal(lastRefreshedLabelTest.getElement().getText());

                });

            });
        });

    });
});