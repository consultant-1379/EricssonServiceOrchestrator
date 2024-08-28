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
 * Date: 06/02/18
 */
define([
    'jscore/core',
    'uit!./NodeChart.html',
    '../Dictionary',
    '../executionplan/ExecutionPlan'

], function (core, View, Dictionary, ExecutionPlan) {
    'use strict';

    /**
     * Widget Container for showing Topology Chart which is to be updated
     * when pass selected  Network Slice
     */

    return core.Widget.extend({

            view: function () {
                return new View({});
            },

            onViewReady: function () {
            },

            /**
             * We are polling Network Slices (this will be called on the poll)
             * @param selectedNetSliceItem  current (or new) Network Slice selection obj
             */
            upDateSelectedNetworkSlice: function (selectedNetSliceItem) {

                if (selectedNetSliceItem.networkSliceId === this.networkSliceId) {

                    this.upDateExecutionPlan();

                } else {

                    this.createExecutionPlan(selectedNetSliceItem);

                }
            },


            upDateExecutionPlan: function () {
                this.executionPlan.upDateExecutionPlan();
            },

            createExecutionPlan: function (selectedNetSliceItem) {

                if (this.executionPlan) {
                    this.executionPlan.detach();
                    this.executionPlan.destroy();
                    delete this.executionPlan;
                }

                this.networkSliceId = selectedNetSliceItem.networkSliceId;

                this.executionPlan = new ExecutionPlan({
                    netSliceItem: selectedNetSliceItem
                });

                this.executionPlan.attachTo(this.getExecutionPlanHolder());
            },


            getExecutionPlanHolder: function () {
                return this.findElementByClassName("-executionPlanHolder");
            },


            /**
             * Adding prefix present on all divs in the widget's html
             * @param suffix   - end of the name
             * @returns {*}
             */
            findElementByClassName: function (suffix) {
                return this.getElement().find(".elEsoTopologylib-wNodeChart" + suffix);
            }

        }
    );
});
