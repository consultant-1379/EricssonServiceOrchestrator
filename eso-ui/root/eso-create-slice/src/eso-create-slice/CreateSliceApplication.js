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
 * Date: 06/12/17
 */
define([
    'jscore/core',
    'jscore/ext/net',
    './Dictionary',
    './CreateSliceNavButtonHelper',

    'layouts/TopSection',
    'widgets/Loader',

    'widgets/Tabs',

    './regions/details/CreateSliceDetailsRegion',
    './regions/workflow/CreateSliceWorkFlowRegion',

    'eso-commonlib/AjaxService',
    'eso-commonlib/Constants',
    'eso-commonlib/HttpConstants',
    'eso-commonlib/DialogUtils',
    'eso-commonlib/UrlConstants',
    'eso-commonlib/Utils'

], function (core, net, Dictionary, CreateSliceNavButtonHelper, TopSection, Loader, Tabs, CreateSliceDetailsRegion, CreateSliceWorkFlowRegion, ajaxService, Constants, HttpConstants, DialogUtils, UrlConstants, Utils) {
    'use strict';

    /**
     * Application to allow user to create Network Slice.
     *
     * If Constants.SHOW_START_WORKFLOW is set :
     * Contains two tabs (regions) which allows user to select a service template (blueprint) and modify
     * the inputs and work-flows associated with the selected service template
     * (i.e. loads dynamic information into form for selected service template)
     *
     *
     *
     * When press "Save" the slice (instance) is created and installed.
     *
     */

    return core.App.extend({

        // may not show any tabs - see Constants.SHOW_START_WORKFLOW
        DETAILS_TAB_POSITION: 0,

        WORKFLOW_TAB_POSITION: 1,


        /**
         * Called when the app is first instantiated in the current tab for the first time.
         */
        onStart: function () {

            this.setupApplication();

        },

        /**
         * This method is called when the user has left your app to view a different app.
         */
        onPause: function () {

            this.tearDownApplication();

        },

        /**
         * Called when the user navigates back to the application.
         *
         * Clear a previous create job inputs.
         */
        onResume: function () {

            this.setupApplication();

        },

        /**
         * Called before the user is about to leave your app, either by navigating away or closing the tab.
         * (this will show warnings if unsaved edits exist)
         */
        onBeforeLeave: function (e) {

            if (e.target !== 'help') {
                return this.needPageLeaveWarning();
            }
            return false;
        },


        setupApplication: function () {
            var topSection = this.createTopSection();

            var content;
            if (this.isShowingWorkFlowOptions()) {
                content = this.createTabsContainingRegions();
            } else {
                content = this.createDetailsRegion();
            }

            topSection.setContent(content);

            topSection.attachTo(this.getElement());

            this.eventBus = this.getEventBus();

            this.addEventBusSubscribers();
        },


        tearDownApplication: function () {
            this.removeEventBusSubscribers();

            if (this.detailsRegion) {
                this.detailsRegion.stop();
            }
            if (this.workFlowRegion) {
                this.workFlowRegion.stop();
            }

            Utils.removeAllChildrenFromElement(this.getElement());

        },

        createTopSection: function () {

            return new TopSection({
                breadcrumb: this.options.breadcrumb,
                title: this.options.properties.title,
                context: this.getContext(),
                defaultActions: CreateSliceNavButtonHelper.getDefaultActions(this.saveAndInstallAction.bind(this), this.cancelPageAction.bind(this))
            });
        },

        createTabsContainingRegions: function () {

            this.createSliceTabs = new Tabs({
                enabled: true,
                tabs: [
                    {title: Dictionary.createSlice.CREATE_SLICE_DETAILS_TAB_TITLE,
                        content: this.createDetailsRegion()

                    },
                    {title: Dictionary.createSlice.CREATE_SLICE_WORKFLOW_TAB_TITLE,
                        content: this.createWorkFlowRegion()
                    }
                ]

            });

            this.enableWorkFlowTab(false);  // selection of service template required first

            this.createSliceTabs.getElement().setStyle("margin-top", "10px");
            return this.createSliceTabs;
        },


        /**
         * this.createSliceTabs will be undefined if not showing tabs
         * (can have a Details and Start WorkFlow Tab)
         * @returns {*}
         */
        isShowingWorkFlowOptions: function () {
            return  Constants.SHOW_START_WORKFLOW;
        },

        createDetailsRegion: function () {
            this.detailsRegion = new CreateSliceDetailsRegion({
                    context: this.getContext()
                }
            );
            return this.detailsRegion;
        },

        createWorkFlowRegion: function () {
            this.workFlowRegion = new CreateSliceWorkFlowRegion({
                    context: this.getContext()
                }
            );
            return this.workFlowRegion;
        },


        addEventBusSubscribers: function () {

            // as can be called on tab press or on start up (don't add if already added)
            if (!Utils.isDefined(this.eventBusSubscriptions) || this.eventBusSubscriptions.length === 0) {

                this.eventBusSubscriptions = [];

                this.eventBusSubscriptions.push(this.eventBus.subscribe(Constants.events.WORK_FLOWS_AVAILABLE, this.enableWorkFlowTab.bind(this)));
                this.eventBusSubscriptions.push(this.eventBus.subscribe(Constants.events.LOADING_EVENT, this.showLoadingAnimation.bind(this)));

            }
        },

        removeEventBusSubscribers: function () {

            if (this.eventBusSubscriptions) {

                var subsLength = this.eventBusSubscriptions.length;
                for (var i = 0; i < subsLength; i++) {
                    this.eventBus.unsubscribe(this.eventBusSubscriptions[i]);
                }
                delete this.eventBusSubscriptions;
            }

        },


        enableWorkFlowTab: function (isEnable) {
            if (this.isShowingWorkFlowOptions()) {
                if (isEnable) {
                    this.createSliceTabs.enableTab(this.WORKFLOW_TAB_POSITION);
                } else {
                    this.createSliceTabs.disableTab(this.WORKFLOW_TAB_POSITION);
                }
            }
        },

        setSelectedTab: function (index) {
            if (this.isShowingWorkFlowOptions()) {
                this.createSliceTabs.setSelectedTab(index);
            }
        },

        /**
         * Test for unsaved changes on page
         * @returns {boolean}  true if unsaved changes
         */
        isAnyRegionDirty: function () {
            return this.detailsRegion.isDirty() || (Utils.isDefined(this.workFlowRegion) && (this.workFlowRegion.isDirty()));
        },

        saveAndInstallAction: function () {

            if (this.isShowingWorkFlowOptions()) {
                this.validateTabs(this.saveWithWarningIfValid.bind(this));
            } else {
                this.detailsRegion.isValid(this.saveWithWarningIfValid.bind(this));
            }

        },


        /**
         * Place in a warning before send call to Save and Execute (or Save)
         */
        saveWithWarningIfValid: function () {

            var isExecutingAlso = (!this.isShowingWorkFlowOptions()) || Utils.isDefined(this.workFlowRegion) && this.workFlowRegion.hasUserSelectedWorkFlow();

            var nameOfSlice = this.detailsRegion.getName();

            var header = (isExecutingAlso) ? Dictionary.dialogMessages.HEADER_SAVE_AND_EXECUTE_NETWORK_SLICE : Dictionary.dialogMessages.HEADER_SAVE_NETWORK_SLICE;

            var message = (isExecutingAlso) ? Dictionary.dialogMessages.SAVE_AND_EXECUTE_NETWORK_SLICE_MESSAGE : Dictionary.dialogMessages.SAVE_NETWORK_SLICE_MESSAGE;

            var messageSecondLine = (isExecutingAlso) ? Dictionary.dialogMessages.SAVE_AND_EXECUTE_NETWORK_SLICE_MESSAGE_LINE2 : Dictionary.dialogMessages.SAVE_NETWORK_SLICE_MESSAGE_LINE2;
            messageSecondLine = messageSecondLine.replace("{0}", nameOfSlice);

            var caption = (isExecutingAlso) ? Dictionary.captions.SAVE_AND_EXECUTE : Dictionary.captions.SAVE;

            // (header, message, messageSecondLine, actionCaption, actionMethod, widthPixelsString, cancelMethod, topRightCloseBtnValue)
            DialogUtils.showWarningDialogWithActionAndCancel(header, message, messageSecondLine, caption, this.sendServerCallToSaveSlice.bind(this), "500px");

        },

        sendServerCallToSaveSlice: function () {
            var nameOfSlice = this.detailsRegion.getName();

            var loadingMessage = Dictionary.loadingMessages.LOADING_CREATING_NETWORK_SLICE;
            loadingMessage = loadingMessage.replace("{0}", nameOfSlice);

            this.showLoadingAnimation(true, loadingMessage);

            var isSendingWorkFlows = Utils.isDefined(this.workFlowRegion) && this.workFlowRegion.hasUserSelectedWorkFlow();
            var payload = {};
            if (isSendingWorkFlows) {

                payload = {
                    name: nameOfSlice,
                    serviceModelId: this.detailsRegion.getServiceTemplateId(),
                    inputs: this.detailsRegion.getServiceTemplateInputs(),
                    workflow_name: this.workFlowRegion.getWorkFlowName(),
                    workflow_inputs: this.workFlowRegion.getWorkFlowInputs()
                };
            } else {

                payload = {
                    name: nameOfSlice,
                    serviceModelId: this.detailsRegion.getServiceTemplateId(),
                    inputs: this.detailsRegion.getServiceTemplateInputs()
                };
            }


            ajaxService.postCall({
                    url: UrlConstants.network_slices.NETWORK_SLICES,
                    data: JSON.stringify(payload),
                    success: this.handleSaveAndInstallActionSuccess.bind(this, nameOfSlice),
                    error: this.handleSaveAndInstallActionError.bind(this, nameOfSlice)
                }

            );
        },

        /**
         * Validate tabs and call success function (save and install) if tabs are valid,
         * otherwise go to the tab where find invalid attribute
         * Used with #validateFinalTab, so jump to tab with error if exists
         *
         * @param successFunction  function to call after validate final tab
         *                         (after all other tabs have been validated)
         */
        validateTabs: function (successFunction) {

            this.setSelectedTab(this.DETAILS_TAB_POSITION);
            this.detailsRegion.isValid(this.validateFinalTab.bind(this, successFunction));

        },

        validateFinalTab: function (successFunction) {
            if (this.workFlowRegion.isValid(successFunction)) {
                this.setSelectedTab(this.DETAILS_TAB_POSITION);
            } else {
                this.setSelectedTab(this.WORKFLOW_TAB_POSITION);  // if both tabs invalid do not care which tab is selected
            }

        },

        handleSaveAndInstallActionSuccess: function (nameOfSlice, response) {

            this.showLoadingAnimation(false);
            this.goToApplicationHomePage(nameOfSlice);  // including name for toast success message when enter home page
        },

        handleSaveAndInstallActionError: function (nameOfSlice, model, response) {

            this.showLoadingAnimation(false);

            /* TODO Server still returning into Error handler with "Request Accepted" ? */
            if (HttpConstants.codes.OK === response.getStatus()) {
                this.handleSaveAndInstallActionSuccess(nameOfSlice);

            } else if (DialogUtils.isSecurityDeniedResponse(response)) {  // unrecoverable (will have to re-login again)

                DialogUtils.showForbiddenDialog(Dictionary.forbiddenActionMessages.CREATE_NETWORK_WORK_SLICE);

            } else {
                /* not an inline for save fail */
                DialogUtils.showError(Dictionary.dialogMessages.HEADER_UNABLE_TO_CREATE_NETWORK_SLICE, response);
            }

        },

        cancelPageAction: function () {
            // let SDK show warning from #beforeLeave
            this.goToApplicationHomePage(false);

        },


        needPageLeaveWarning: function () {

            if ((!this.hasSaveBeenPressed) && this.isAnyRegionDirty()) {

                if (this.isShowingWorkFlowOptions()) {
                    if (this.detailsRegion.isDirty()) {
                        this.setSelectedTab(this.DETAILS_TAB_POSITION);
                    } else if (this.workFlowRegion.isDirty()) {
                        this.setSelectedTab(this.WORKFLOW_TAB_POSITION);
                    }
                }
                return true;
            }
            return false;
        },


        goToApplicationHomePage: function (nameOfSliceFollowingSuccess) {

            this.hasSaveBeenPressed = (nameOfSliceFollowingSuccess !== false);

            if (nameOfSliceFollowingSuccess) {
                var queryParam = Constants.hashQueryParams.NET_SLICE_NAME_EQUALS + nameOfSliceFollowingSuccess;
                window.location.hash = Constants.lcHash.APP_HOME_PAGE_CREATE_SLICE_SUCCESS + '?' + queryParam;

            } else {
                window.location.hash = Constants.lcHash.APP_HOME_PAGE;

            }
        },

        /* Loading life cycle */

        /**
         * This loading animation shall block out the region.
         *
         * @param isShow - if true the loader is displayed, otherwise it is destroyed
         */
        showLoadingAnimation: function (isShow, message) {
            if (isShow) {
                this.createLoadingAnimation(message);
            } else {
                this.destroyLoadingAnimation();
            }
        },

        createLoadingAnimation: function (message) {
            if (typeof this.loader === 'undefined') {
                this.loader = new Loader({
                    loadingText: message
                });
                this.loader.attachTo(this.getElement());
            }

        },

        destroyLoadingAnimation: function () {
            if (typeof this.loader !== 'undefined') {
                this.loader.destroy();
                delete this.loader;
            }
        }

    });
})
;
