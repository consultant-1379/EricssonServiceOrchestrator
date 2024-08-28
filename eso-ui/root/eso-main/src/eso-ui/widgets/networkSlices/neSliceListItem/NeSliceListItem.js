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
 * Date: 29/11/17
 */
define([
    'jscore/core',
    'uit!./NeSliceListItem.html',
    '../../../Dictionary',
    'widgets/InfoPopup',
    'widgets/tree/Item',
    'eso-commonlib/Constants',
    'eso-commonlib/Utils'

], function (core, View, Dictionary, InfoPopup, TreeItem, Constants, Utils) {
    'use strict';

    /**
     *
     * Widget representing single item in Network Slice List Display Widget
     *
     * (extends TreeItem to get extra functionality such as #select)
     */

    return TreeItem.extend({


        HTML_PREFIX: '.eaEsoUi-wNeSliceListItem',


        init: function (options) {
            this.options = options ? options : {};
        },

        view: function () {

            return new View(Dictionary.networkSliceList);
        },

        onViewReady: function () {

            this.setInitialNetworkSliceValues(this.options);

        },

        onDestroy: function () {

        },


        /**
         *  Only setting once as will replace whole item
         *
         *  @param data
         *
         *         networkSliceId : item.networkSliceId,
         *         networkSliceName: item.networkSliceName,
         *         executionState: item.executionState,
         *         progressStatus: item.progressStatus,
         *         serviceTemplateName: item.serviceTemplateName,
         *         errorDetails: item.errorDetails,
         *         initializationTime: item.initializationTime
         *         workFlowName : item.workFlowName
         */
        setInitialNetworkSliceValues: function (data) {

            this.networkSliceId = data.networkSliceId;

            this.networkSliceName = data.networkSliceName;

            this.getNetworkSliceIdValue().setText(this.networkSliceName);

            // Let all server display formatting come from back end
            this.getInitializationTime().setText((data.initializationTime) ? data.initializationTime : Dictionary.UNDEFINED_VALUE);

            this.getServiceTemplateIdValue().setText(data.serviceTemplateName);

            this.handleLastWorkFlowNameValue(data);

            this.showProgressInformation(data.executionState, data.progressStatus);

        },


        /**
         * Show Last work flow name with status icon,
         * or bold text (No work flow executed) if no work flow
         *
         * @param data
         */
        handleLastWorkFlowNameValue: function (data) {

            var lastWorkFlowNameValue = this.getLastWorkFlowNameValue();

            lastWorkFlowNameValue.setText(Utils.isDefined(data.workFlowName) ? data.workFlowName : Dictionary.NO_WORK_FLOW_EXECUTED_MESSAGE);

            this.hideAllStatusIcons();

            if (lastWorkFlowNameValue.getText() === Dictionary.NO_WORK_FLOW_EXECUTED_MESSAGE) {
                lastWorkFlowNameValue.setStyle("font-weight", "bold");

            } else {

                this.showStatusIcon(data.executionState, data.errorDetails);
                lastWorkFlowNameValue.setStyle("font-weight", "normal");
            }
        },

        showStatusIcon: function (executionState, errorDetails) {

            var executionIcon = this.getStatusIcon(executionState);

            if (Utils.isDefined(executionIcon)) {

                Utils.showElementInlineBlock(executionIcon, true);

                switch (executionState) {

                    case Constants.executionStates.FAILED_EXECUTION_STATE:
                        this.attachErrorInfoPopUp(executionIcon, executionState, errorDetails);
                        break;


                    default :
                        this.detachErrorInfoPopUp();


                }

            }
        },

        attachErrorInfoPopUp: function (executionIcon, executionState, errorDetails) {
            if (typeof this.infoPopupError === 'undefined') {
                this.infoPopupError = new InfoPopup({
                    content: errorDetails,     // TODO would prefer this localised though dictionary
                    icon: 'error'
                });
                this.infoPopupError.attachTo(executionIcon);   // TODO hidden here - perhaps would not know to click

            } else {
                this.infoPopupError.setContent(errorDetails);
            }
        },

        detachErrorInfoPopUp: function () {
            if (Utils.isDefined(this.infoPopupError)) {
                this.infoPopupError.detach();
                this.infoPopupError.destroy();
                delete this.infoPopupError;

            }
        },

        hideAllStatusIcons: function () {

            this.getAllStatusIcons().forEach(function (icon) {
                icon.setStyle("display", "none");
            });
        },

        showProgressInformation: function (executionState, progressValue) {
            var progressDialogHolder = this.getProgressBarHolder();

            // TODO we will in time have a PAUSED state and show something else here then

            var isShowingProgressInfo = (executionState === Constants.executionStates.IN_PROGRESS_EXECUTION_STATE);

            progressDialogHolder.setStyle("display", (isShowingProgressInfo) ? "table-row" : "none");

            if (isShowingProgressInfo) {

                this.getProgressValueHolder().setAttribute("value", progressValue);
                this.getProgressPercentageHolder().setText(progressValue + "%");

            }
        },


        /* DOM interaction */

        getNetworkSliceIdValue: function () {
            return this.findElementByClassName("-networkSliceID-value");
        },

        getInitializationTime: function () {
            return this.findElementByClassName("-initializationTime-value");
        },

        getServiceTemplateIdValue: function () {
            return this.findElementByClassName("-serviceTemplateName-value");
        },

        getLastWorkFlowNameValue: function () {
            return this.findElementByClassName("-lastWorkFlowName-value");
        },

        getProgressBarHolder: function () {
            return this.findElementByClassName("-progressRow");
        },

        getProgressValueHolder: function () {
            return this.findElementByClassName("-progressValue");
        },

        getProgressPercentageHolder: function () {
            return this.findElementByClassName("-progressPercent");
        },

        getStatusIcon: function (status) {
            return this.findElementByClassName("-status-status" + status);
        },


        getAllStatusIcons: function () {
            // note #findAll
            return this.getElement().findAll(this.HTML_PREFIX + "-status-icon");
        },


        /**
         * Adding prefix present on all divs in the widget's html
         * @param suffix   - end of the name
         * @returns {*}
         */
        findElementByClassName: function (suffix) {
            return this.getElement().find(this.HTML_PREFIX + suffix);
        }

    });

});