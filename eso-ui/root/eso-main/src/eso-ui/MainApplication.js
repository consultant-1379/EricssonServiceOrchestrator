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
    'jscore/ext/net',
    'container/api',
    'jscore/ext/locationController',
    './Dictionary',
    './MainAppNavButtonHelper',

    'layouts/TopSection',
    'layouts/MultiSlidingPanels',

    'eso-commonlib/Constants',
    'eso-commonlib/DialogUtils',
    'eso-commonlib/HttpConstants',
    'eso-commonlib/UrlConstants',
    'eso-commonlib/Utils',

    './regions/networkSlices/NetworkSlicesRegion',
    './regions/main/MainRegion'

], function (core, net, containerApi, LocationController, Dictionary, MainAppNavButtonHelper, TopSection, MultiSlidingPanels, Constants, DialogUtils, HttpConstants, UrlConstants, Utils, NetworkSlicesRegion, MainRegion) {
    'use strict';


    /**
     * This is the first class that will be called when start the ESO UI (i.e. via app.config.js)
     *
     * Presents Network Slices region on the left of a Multi-sliding panel with a "main" region in the main area.
     * See region packages.
     */

    return core.App.extend({

        /**
         * Called when the app is first instantiated in the current tab for the first time.
         */
        onStart: function () {

            this.createLocationController();

            var topSection = this.createTopSection();

            this.networkSlicesRegion = new NetworkSlicesRegion({
                context: this.getContext(),
                upDateNetworkSlicesTitle: this.upDateNetworkSlicesTitle.bind(this)
            });

            this.mainRegion = new MainRegion({
                context: this.getContext()
            });

            this.multiSlidingPanel = this.createMultiSlidingPanel();

            topSection.setContent(this.multiSlidingPanel);
            topSection.attachTo(this.getElement());
        },

        /**
         * This method is called when the user has left your app to view a different app.
         */
        onPause: function () {
            if (Utils.isDefined(this.networkSlicesRegion)) {
                this.networkSlicesRegion.stopPolling();
            }
            if (Utils.isDefined(this.locationController)) {
                this.locationController.stop();
            }
        },

        /**
         * Called when the user navigates back to the application.
         */
        onResume: function () {

            if (Utils.isDefined(this.networkSlicesRegion)) {
                this.networkSlicesRegion.startPolling();
            }

            if (Utils.isDefined(this.locationController)) {
                this.locationController.start();
            }


        },

        /**
         * Called before the user is about to leave your app, either by navigating away or closing the tab.
         */
        onBeforeLeave: function () {

            if (Utils.isDefined(this.networkSlicesRegion)) {
                this.networkSlicesRegion.stopPolling();
            }
            if (Utils.isDefined(this.mainRegion)) {
                /* TODO nothing in Main region yet */
            }
        },

        /**
         * Creates a location controller widget to the app and adds a listener.
         */
        createLocationController: function () {
            this.locationController = new LocationController();
            this.locationController.addLocationListener(this.onLocationChange.bind(this), this.getContext());
            this.locationController.start();
        },


        createTopSection: function () {

            return new TopSection({
                breadcrumb: this.options.breadcrumb,
                title: this.options.properties.title,
                context: this.getContext(),
                defaultActions: MainAppNavButtonHelper.getDefaultActions()
            });
        },


        createMultiSlidingPanel: function () {

            return new MultiSlidingPanels({
                context: this.getContext(),
                resolutionThreshold: 700,
                leftWidth: 500,
                resizeable: true, // default is false
                showLabel: true,
                main: {
                    label: Dictionary.titles.MAIN_DASH_BOARD_TITLE,
                    content: this.mainRegion
                },
                left: [
                    {
                        label: Dictionary.titles.NETWORK_SLICES_TITLE,
                        value: Constants.NETWORK_SLIDE_SUBTLE_BUTTON_NAME_FOR_DIV,  // for subtle button
                        content: this.networkSlicesRegion,
                        expanded: true
                    }
                ]

            });
        },

        /**
         * Update Title on left side of Multi-sliding panel (Network Slices), to show count and  "filter applied" information
         *
         * @param slicesInfoCountString   could be "(number)" could contain filter reference ("number -  Filtered") - or undefined
         */
        upDateNetworkSlicesTitle: function (slicesInfoCountString) {

            if (Utils.isDefined(slicesInfoCountString)) {

                this.multiSlidingPanel.view.setHeader("left", Dictionary.titles.NETWORK_SLICES_TITLE + "    " + slicesInfoCountString);

            } else {
                this.multiSlidingPanel.view.setHeader("left", Dictionary.titles.NETWORK_SLICES_TITLE);
            }
        },

        /**
         * Callback on the location controller.
         * This method would be called every time the location (hash) changes
         * within this main app
         *
         * (Using the hash sometime to show a toast message on home page,
         * and after the toast is shown will set back the hash to regular home page hash)
         */
        onLocationChange: function (hash, pathObj) {

            containerApi.getEventBus().publish("contextmenu:hide");

            var path = pathObj.path;
            var queryParams = pathObj.query;   // can be empty object

            var hashPath = '#' + path;
            var sliceName, toastMsg, sliceNameToSelect;

            try {

                switch (hashPath) {

                    case Constants.lcHash.APP_HOME_PAGE:

                        break;

                    case Constants.lcHash.APP_HOME_PAGE_CREATE_SLICE_SUCCESS:

                        sliceName = queryParams [Constants.hashQueryParams.NET_SLICE_NAME];
                        toastMsg = Dictionary.toasts.SLICE_CREATED_SUCCESS_TOAST;
                        toastMsg = toastMsg.replace("{0}", sliceName);

                        sliceNameToSelect = sliceName;
                        break;

                    case Constants.lcHash.APP_HOME_PAGE_DELETE_SLICE_SUCCESS:

                        sliceName = queryParams [Constants.hashQueryParams.NET_SLICE_NAME];
                        toastMsg = Dictionary.toasts.SLICE_DELETE_SUCCESS_TOAST;
                        toastMsg = toastMsg.replace("{0}", sliceName);
                        break;

                    case Constants.lcHash.APP_HOME_PAGE_START_WORK_FLOW_SUCCESS:

                        sliceName = queryParams [Constants.hashQueryParams.NET_SLICE_NAME];
                        toastMsg = Dictionary.toasts.SLICE_START_WORK_FLOW_SUCCESS_TOAST;
                        toastMsg = toastMsg.replace("{0}", sliceName);
                        sliceNameToSelect = sliceName;

                        break;

                }

            } catch (error) {

                Utils.log("MainApplication.js : Internal location change error. Stack trace is:");
                Utils.log(error.stack);

            }

            if (Utils.isDefined(toastMsg)) {
                this.showToastMessage(toastMsg);
                window.location.hash = Constants.lcHash.APP_HOME_PAGE;
            }

            /* update may have happened by now - not waiting for next poll*/
            if (Utils.isDefined(this.networkSlicesRegion)) {
                this.networkSlicesRegion.fetchNetworkSlicesListFromServer(true, sliceNameToSelect);
            }
        },

        showToastMessage: function (toastMsg) {

            var notificationWidget = DialogUtils.createSuccessToastNotification(toastMsg);
            notificationWidget.attachTo(this.getElement());

        }

    });
});
