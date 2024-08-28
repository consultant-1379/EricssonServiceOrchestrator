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
 * Date: 27/11/17
 */
define([
    'jscore/core',
    'uit!./MainRegion.html',
    '../../Dictionary',
    'widgets/InlineMessage',
    'widgets/Tabs',

    "eso-commonlib/Utils",
    "eso-commonlib/Constants",
    "eso-topologylib/NodeChart"
], function (core, View, Dictionary, InlineMessage, Tabs, Utils, Constants, NodeChart) {
    'use strict';

    /**
     * Main home page region which will hold Topology charts, etc
     *
     * This class will just handle updating title of selection and showing
     * messages for no selection or empty network slice list  (start up position of UI)
     *
     * It will create the widgets added to be displayed on main region dependant on Network Slice Selection
     *
     */

    return core.Region.extend({


        view: function () {


            /* using InlineMessage as an asset in HTML rather than widget to add bold, etc, text */
            var noSliceLineTwo = Dictionary.inline.MAIN_PAGE_NO_SLICES_DESCRIPTION_LINE_TWO;
            noSliceLineTwo = noSliceLineTwo.replace("{0}", Constants.lcHash.SERVICE_TEMPLATE_APP);

            var noSliceLineThree = Dictionary.inline.MAIN_PAGE_NO_SLICES_DESCRIPTION_LINE_THREE;
            noSliceLineThree = noSliceLineThree.replace("{0}", "<b>" + Dictionary.captions.CREATE_SLICE + "</b>");

            return new View({

                "MAIN_PAGE_NO_SLICES_HEADER": Dictionary.inline.MAIN_PAGE_NO_SLICES_HEADER,
                "MAIN_PAGE_NO_SLICES_DESCRIPTION_LINE_ONE": Dictionary.inline.MAIN_PAGE_NO_SLICES_DESCRIPTION_LINE_ONE,
                "MAIN_PAGE_NO_SLICES_DESCRIPTION_LINE_TWO": noSliceLineTwo,
                "MAIN_PAGE_NO_SLICES_DESCRIPTION_LINE_THREE": noSliceLineThree


            });
        },

        /**
         * Construct main region
         * @param options
         *
         */
        init: function (options) {
            this.options = options ? options : {};

        },

        onStart: function () {

            this.addEventBusSubscribers();

            this.handleNetworkSliceListPopulation(false);


        },

        onStop: function () {
            this.removeEventBusSubscribers();
            this.tearDown();
        },


        addEventBusSubscribers: function () {

            if (!Utils.isDefined(this.eventBusSubscriptions) || this.eventBusSubscriptions.length === 0) {
                var eventBus = this.getEventBus();
                this.eventBusSubscriptions = [];

                this.eventBusSubscriptions.push(eventBus.subscribe(Constants.events.NETWORK_SLICE_LIST_UPDATED, this.handleNetworkSliceListPopulation.bind(this)));
                this.eventBusSubscriptions.push(eventBus.subscribe(Constants.events.NETWORK_SLICE_SELECTED_OR_DESELECTED, this.upDateSelectedNetworkSlice.bind(this)));

            }
        },

        removeEventBusSubscribers: function () {

            if (this.eventBusSubscriptions) {

                var subsLength = this.eventBusSubscriptions.length;
                var eventBus = this.getEventBus();
                for (var i = 0; i < subsLength; i++) {
                    eventBus.unsubscribe(this.eventBusSubscriptions[i]);
                }
                delete this.eventBusSubscriptions;
            }
        },

        tearDown: function () {

            if (this.tabsWidget) {
                this.tabsWidget.detach();
                this.tabsWidget.destroy();
                delete this.tabsWidget;
            }
            delete this.nodeChart;
            Utils.removeAllChildrenFromElement(this.getContentHolder());

        },


        /**
         * Handle population (or deletion) of slices in the Network slices list
         *
         * @param containsSlices           true if list has slices (not empty)
         * @param currentSelectedItemData  data current selected item in the list (if any)
         */
        handleNetworkSliceListPopulation: function (containsSlices, currentSelectedItemData) {

            if (containsSlices) {
                this.upDateSelectedNetworkSlice(currentSelectedItemData);
            } else {
                this.showTitle(false);
                this.tearDown();
            }
            this.showNoSlicesMessage(!containsSlices);
        },

        showNoSlicesMessage: function (isShow) {
            /* if showing "no slices message" must clear any existing "no selection" messages too */
            if (isShow) {
                Utils.removeAllChildrenFromElement(this.getInlineMessageHolder());
            }

            this.getNoSlicesMessageHolder().setStyle("display", (isShow) ? "block" : "none");

        },

        showNoSelectionMessage: function (isShow) {

            this.showTitle(!isShow);

            if (isShow) {
                this.showNoSlicesMessage(false);

                if (typeof this.noSelectionMessage === 'undefined') {

                    this.noSelectionMessage = new InlineMessage({
                        header: Dictionary.inline.NO_NETWORK_SLICE_SELECTED_HEADER,
                        description: Dictionary.inline.NO_NETWORK_SLICE_SELECTED
                    });
                }

                this.showInlineMessage(true, this.noSelectionMessage);
            } else {
                this.showInlineMessage(false);
            }
        },


        /**
         * Handle Selection of a Network Slice in the list
         *
         * @param selectedItemData   Data passed from server to display Network Slice
         *                           Can be undefined if un-selecting
         */
        upDateSelectedNetworkSlice: function (selectedItemData) {

            var isSliceSelected = Utils.isDefined(selectedItemData);

            this.showNoSelectionMessage(!isSliceSelected);

            if (isSliceSelected) {

                this.showTitle(true, selectedItemData.networkSliceName);
                this.displayDataForSlice(selectedItemData);

            } else {
                this.showTitle(false);
                this.tearDown();   // if no slice selected clear all

            }

        },

        /**
         * Create content of Main Page depending on selected slice
         * @param selectedItem
         */
        displayDataForSlice: function (selectedItem) {

            if (typeof this.nodeChart === 'undefined') {

                this.nodeChart = new NodeChart();

//                // TODO There could be widgets/Tabs here in the future taking content or just add content direct to DOM
//
//                this.tabsWidget = new Tabs({
//                        tabs: [
//                            {title: Dictionary.titles.TOPOLOGY,
//                                content: this.nodeChart}
//                        ]
//                    }
//                );
//                this.tabsWidget.attachTo(this.getContentHolder());


                this.nodeChart.attachTo(this.getContentHolder());
            }

            if (Constants.SHOW_NODE_GRAPHS) {
                this.nodeChart.upDateSelectedNetworkSlice(selectedItem);
            }


        },


        showTitle: function (isShow, text) {
            var title = this.getTitle();
            title.setStyle("display", (isShow) ? "block" : "none");
            title.setText(text);

        },

        /**
         * Attach InlineMessage object
         * after removing all other elements on DOM and top section context buttons
         *
         * @param isShow         show or hide current message
         * @param inlineMessage  constructed InlineMessage
         */
        showInlineMessage: function (isShow, inlineMessage) {
            this.getInlineMessageHolder().setStyle("display", isShow ? "block" : "none");
            if (inlineMessage) {
                Utils.removeAllChildrenFromElement(this.getInlineMessageHolder());
                inlineMessage.attachTo(this.getInlineMessageHolder());
            }

        },

        /* DOM interaction */

        getContentHolder: function () {
            return this.findElementByClassName("-content");
        },

        getNoSlicesMessageHolder: function () {
            return this.findElementByClassName("-noSlicesMessageHolder");
        },

        getInlineMessageHolder: function () {
            return this.findElementByClassName("-inlineMessageHolder");
        },

        getTitle: function () {
            return this.findElementByClassName("-title");
        },

        /**
         * Adding prefix present on all divs in the widget's html
         * @param suffix   - end of the name
         * @returns {*}
         */
        findElementByClassName: function (suffix) {
            return this.getElement().find(".eaEsoUi-rMainRegion" + suffix);
        }

    });

});
