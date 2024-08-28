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
 * Date: 19/12/17
 */
define([
    'jscore/core',
    '../../Dictionary',
    'uit!./StartWorkFlowDialog.html',

    'widgets/Dialog',
    'widgets/InlineMessage',
    'widgets/Loader',

    'eso-commonlib/AjaxService',
    'eso-commonlib/Constants',
    'eso-commonlib/DialogUtils',
    'eso-commonlib/FetchWorkFlowHandler',
    'eso-commonlib/HttpConstants',
    'eso-commonlib/Utils',
    'eso-commonlib/UrlConstants'


], function (core, Dictionary, View, Dialog, InlineMessage, Loader, ajaxService, Constants, DialogUtils, FetchWorkFlowHandler, HttpConstants, Utils, UrlConstants) {
    'use strict';


    /**
     * Widget displaying Start Work Flow options in a Dialog Box for
     * a chosen Network Slice Name.
     *
     * Will make a PUT call to server to start a workflow for the network slice name
     */

    return core.Widget.extend({

        /**
         *
         * @param options
         */
        init: function (options) {
            this.options = options ? options : {};

            this.eventBus = this.options.eventBus;
            this.networkSliceName = this.options.networkSliceName;
            this.serviceTemplateName = this.options.serviceTemplateName;
        },

        view: function () {
            return new View({});
        },


        /**
         * Entry point - show a Dialog containing this content
         */
        showStartWorkFlowDialog: function () {

            var workFlowDialog = new Dialog({
                header: Dictionary.titles.START_WORKFLOW,
                content: this,
                optionalContent: this.networkSliceName + " : " + this.serviceTemplateName,
                topRightCloseBtn: true
            });

            this.parentDialog = workFlowDialog;

            this.setDialogButtonsExecutionEnabled(false);
            this.parentDialog.show();
            this.hideHandlerEventId = this.parentDialog.addEventHandler("hide", this.cleanUpOnCloseAction.bind(this));

        },


        onViewReady: function () {

            this.addEventBusSubscribers();

            this.makeServerCallToFetchWorkFlows();

        },

        makeServerCallToFetchWorkFlows: function () {


            this.fetchWorkFlowHandler = new FetchWorkFlowHandler({

                    eventBus: this.eventBus,
                    getWorkFlowFormHolder: this.getWorkFlowFormHolder.bind(this),
                    showLoadingAnimation: this.showLoadingAnimation.bind(this),
                    handleErrorResponse: this.handleErrorResponse.bind(this),
                    isWorkFlowMandatory: true   // no "None" option
                }

            );

            this.fetchWorkFlowHandler.makeServerCallToFetchWorkFlows(this.serviceTemplateName);
        },


        addEventBusSubscribers: function () {

            // as can be called on tab press or on start up (don't add if already added)
            if (!Utils.isDefined(this.eventBusSubscriptions) || this.eventBusSubscriptions.length === 0) {

                this.eventBusSubscriptions = [];

                this.eventBusSubscriptions.push(this.eventBus.subscribe(Constants.events.WORK_FLOW_SELECTED, this.setDialogButtonsExecutionEnabled.bind(this)));
                this.eventBusSubscriptions.push(this.eventBus.subscribe(Constants.events.WORK_FLOWS_AVAILABLE, this.handleNoWorkFlowAvailable.bind(this)));

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

        cleanUpOnCloseAction: function () {
            this.destroy();
        },

        onDestroy: function () {
            this.removeEventBusSubscribers();

            if (this.fetchWorkFlowHandler) {
                this.fetchWorkFlowHandler.handleCleanUpOnClose();
            }

            if (this.parentDialog) {
                this.parentDialog.removeEventHandler(this.hideHandlerEventId);
                delete this.hideHandlerEventId;
                delete this.parentDialog;

            }
        },


        /**
         * Event bus Constants.events.WORK_FLOWS_AVAILABLE subscribed method
         * @param areWorkFlowsInSelectBox    false when select box is empty
         */
        handleNoWorkFlowAvailable: function (areWorkFlowsInSelectBox) {
            if (!areWorkFlowsInSelectBox) {
                this.showNoWorkFlowsFoundMessage();
            }

        },

        /**
         * Method to call on Dialog "Save & Execute" button press
         */
        checkUserInputAndCallSuccessFunction: function () {
            this.fetchWorkFlowHandler.checkUserInputAndCallSuccessFunction(this.saveWithWarningIfValid.bind(this));

        },

        saveWithWarningIfValid: function () {

            var loadingMessage = Dictionary.loadingMessages.LOADING_CREATING_NETWORK_SLICE;
            loadingMessage = loadingMessage.replace("{0}", this.networkSliceName);

            this.showLoadingAnimation(true, loadingMessage);

            var payload = {

                workflow_name: this.fetchWorkFlowHandler.getWorkFlowName(),
                workflow_inputs: this.fetchWorkFlowHandler.getWorkFlowInputs()
            };

            /* PUT call to Start Work Flow for Network Slice assuming will not hawe an Id at point of call,
             * i.e. if starting on slice create time */
            ajaxService.putCall({
                    url: UrlConstants.network_slices.NETWORK_SLICES + "/" + this.networkSliceName,  // caution - server must ensure unique names
                    data: JSON.stringify(payload),
                    success: this.handleSaveAndInstallActionSuccess.bind(this),
                    error: this.handleSaveAndInstallActionError.bind(this)

                }

            );

        },

        handleSaveAndInstallActionSuccess: function (response) {

            this.showLoadingAnimation(false);
            var queryParam = Constants.hashQueryParams.NET_SLICE_NAME_EQUALS + this.networkSliceName;

            window.location.hash = Constants.lcHash.APP_HOME_PAGE_START_WORK_FLOW_SUCCESS + '?' + queryParam;
        },

        handleSaveAndInstallActionError: function (model, response) {

            /* already are in a dialog - not creating more dialogs */

            this.showLoadingAnimation(false);

            var forbiddenMessage;

            if (HttpConstants.codes.OK === response.getStatus()) {

                this.handleSaveAndInstallActionSuccess();

            } else if (DialogUtils.isSecurityDeniedResponse(response)) {  // unrecoverable (will have to re-login again)
                forbiddenMessage = Dictionary.forbiddenActionMessages.START_WORK_FLOW;
            }
            this.handleErrorResponse(response, forbiddenMessage);
        },


        /**
         * Handling error (for fetching work-flows also)
         * Showing as inline messages - as we are a Dialog already
         */
        handleErrorResponse: function (response, forbiddenMessage) {
            if (Utils.isDefined(forbiddenMessage)) {  // unrecoverable (will have to re-login again)

                this.showInlineMessage(DialogUtils.createForbiddenInlineMessage(forbiddenMessage));

            } else {

                this.showInlineMessage(DialogUtils.createErrorInlineMessage(response));
            }

            this.setDialogButtonsExecutionEnabled(false);
        },

        /**
         *  Event bus Constants.events.WORK_FLOW_SELECTED subscribed method
         * @param isExecutionEnabled
         */
        setDialogButtonsExecutionEnabled: function (isExecutionEnabled) {
            this.parentDialog.setButtons(getDialogButtons(isExecutionEnabled, this.parentDialog, this.checkUserInputAndCallSuccessFunction.bind(this)));
        },


        showNoWorkFlowsFoundMessage: function () {

            var msgDescription = Dictionary.inline.NO_WORK_FLOW_FOUND;
            msgDescription = msgDescription.replace("{0}", this.networkSliceName);
            msgDescription = msgDescription.replace("{1}", this.serviceTemplateName);

            var infoInlineMessage = new InlineMessage({
                header: Dictionary.inline.NO_WORK_FLOW_FOUND_HEADER,
                description: msgDescription
            });

            this.showInlineMessage(infoInlineMessage);

        },


        showInlineMessage: function (inlineMessage) {

            Utils.removeAllChildrenFromElement(this.getWorkFlowFormHolder());

            inlineMessage.attachTo(this.getInlineMessageHolder());
        },


        /* Loading life cycle */

        /**
         * This loading animation shall block out the region
         * (Network Slices Area only)
         *
         * @param isShow - if true the loader is displayed, otherwise it is destroyed
         */
        showLoadingAnimation: function (isShow, loadingMessage) {
            if (isShow) {
                this.createLoadingAnimation(loadingMessage);
            } else {
                this.destroyLoadingAnimation();
            }
        },

        createLoadingAnimation: function (loadingMessage) {
            if (typeof this.loader === 'undefined') {
                this.loader = new Loader({
                        loadingText: loadingMessage } //Dictionary.loadingMessages.LOADING_NETWORK_SLICES}
                );
                this.loader.attachTo(this.getWorkFlowFormHolder());
            }

        },

        destroyLoadingAnimation: function () {
            if (typeof this.loader !== 'undefined') {
                this.loader.destroy();
                delete this.loader;
            }
        },

        /* DOM interaction */

        getWorkFlowFormHolder: function () {
            return this.findElementByClassName("-content");
        },

        getInlineMessageHolder: function () {
            return this.findElementByClassName("-inlineMessageHolder");
        },

        /**
         * Adding prefix present on all divs in the widget's html
         * @param suffix   - end of the name
         * @returns {*}
         */
        findElementByClassName: function (suffix) {
            return this.getElement().find(".eaEsoUi-wStartWorkFlowDialog" + suffix);
        }

    });


    function getDialogButtons(isExecuteEnabled, workFlowDialog, executeAction) {

        return [
            {
                caption: Dictionary.captions.SAVE_AND_EXECUTE,
                color: 'darkBlue',
                enabled: isExecuteEnabled,
                action: function () {
                    executeAction();
                    // workFlowDialog.hide();
                }
            },
            {
                caption: Dictionary.captions.CANCEL,
                action: function () {
                    workFlowDialog.hide();
                }
            }
        ];

    }
});
