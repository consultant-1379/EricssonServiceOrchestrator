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
    "eso-commonlib/RefreshWidget"
], function (core, RefreshWidget) {
    'use strict';

    var sandbox, refreshWidgetToTest;

    describe('Refresh widget', function () {

        beforeEach(function () {

            refreshWidgetToTest = new RefreshWidget();

            sandbox = sinon.sandbox.create();

        });

        afterEach(function () {
            sandbox.restore();
            refreshWidgetToTest.handleHouseKeepingOnClose();
        });


        it("should not be undefined", function () {
            expect(RefreshWidget).not.to.be.undefined;
        });

        describe("RefreshWidget Tests", function () {


            describe('resetItemToRefresh test methods', function () {


                it("handle passed item without #handleRefresh method should make component invisible", function () {

                    var item = {

                    };
                    refreshWidgetToTest.resetItemToRefresh(item);
                    expect(refreshWidgetToTest.getElement().getStyle("display")).to.equal("none");

                });


                it("handle passed item with #handleRefresh method should make component visible", function () {


                    var item = {
                        handleRefresh: function () {
                        }
                    };
                    refreshWidgetToTest.resetItemToRefresh(item);

                    expect(refreshWidgetToTest.getElement().getStyle("display")).to.equal("inline");

                });

            });


            describe('event handler test methods', function () {

                var isCalled;

                beforeEach(function () {

                    isCalled = false;

                });


                it("icon holder should handle click event", function () {

                    var item = {
                        handleRefresh: function () {
                            isCalled = true;
                        }
                    };
                    refreshWidgetToTest.resetItemToRefresh(item);

                    refreshWidgetToTest.getRefreshIconHolder().trigger('click');

                    expect(isCalled).to.equal(true);

                });

            });

        });

    });
});

