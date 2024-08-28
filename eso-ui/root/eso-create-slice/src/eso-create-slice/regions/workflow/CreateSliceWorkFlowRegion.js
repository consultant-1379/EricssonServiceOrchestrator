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
    'uit!./CreateSliceWorkFlowRegion.html',
    '../../CreateSliceNavButtonHelper',
    'eso-commonlib/Constants',
    'eso-commonlib/FetchWorkFlowHandler',
    'eso-commonlib/Utils',
    'eso-commonlib/UrlConstants',
    'eso-commonlib/DialogUtils'



], function (core, View, CreateSliceNavButtonHelper, Constants, FetchWorkFlowHandler, Utils, UrlConstants, DialogUtils) {
    'use strict';

    /**
     * Class for details tab allowing user to choose a work flow its associated inputs (parameters)
     *
     * Note a workflow can also be started by right click context menu on Network Slice, so trying to
     * use shared code
     */

    return core.Region.extend({

        View: View,


        /**
         * Initialise
         */
        init: function (options) {

            this.options = (options) ? options : {};

            this.eventBus = this.getEventBus();

            this.fetchWorkFlowHandler = new FetchWorkFlowHandler({
                    eventBus: this.eventBus,
                    getWorkFlowFormHolder: this.getWorkFlowFormHolder.bind(this),
                    showLoadingAnimation: this.showLoadingAnimation,
                    handleErrorResponse: this.handleErrorResponse,
                    isWorkFlowMandatory: false     /* show a "None" option */

                }
            );

            this.addEventBusSubscribers();   // used to populate select box before tab select

        },


        /**
         * called when first select workflow tab
         * (which is initially disabled -
         * i.e. will be enabled only when has content, known via eventBus subscribe in main Application (CreateSliceApplication))
         */
        onStart: function () {

        },

        onStop: function () {

            this.removeEventBusSubscribers();

            this.fetchWorkFlowHandler.handleCleanUpOnClose();

        },


        /**
         * Information required for "Save & Install" call
         */
        getWorkFlowName: function () {
            return this.fetchWorkFlowHandler.getWorkFlowName();
        },


        /**
         * Information required for "Save & Install" call
         */
        getWorkFlowInputs: function () {
            return this.fetchWorkFlowHandler.getWorkFlowInputs();
        },


        isDirty: function () {
            return this.fetchWorkFlowHandler.hasUserSelectedWorkFlow();
        },

        isValid: function (successFunction) {
            return this.fetchWorkFlowHandler.isValid(successFunction);
        },

        hasUserSelectedWorkFlow: function () {
            return this.fetchWorkFlowHandler.hasUserSelectedWorkFlow();
        },


        addEventBusSubscribers: function () {

            if (!Utils.isDefined(this.eventBusSubscriptions) || this.eventBusSubscriptions.length === 0) {

                this.eventBusSubscriptions = [];
                this.eventBusSubscriptions.push(this.eventBus.subscribe(Constants.events.SERVICE_TEMPLATE_SELECTED, this.makeServerCallToFetchWorkFlows.bind(this)));
                this.eventBusSubscriptions.push(this.eventBus.subscribe(Constants.events.WORK_FLOW_SELECTED, this.handleWorkFlowSelected.bind(this)));

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

        handleWorkFlowSelected: function (isWorkFlowSelected) {

            if (isWorkFlowSelected) {  // include "None" as not selected

                this.eventBus.publish('topsection:contextactions', CreateSliceNavButtonHelper.getActionsWhenWorkFlowSelected());
            } else {
                this.eventBus.publish('topsection:leavecontext');
            }

        },


        makeServerCallToFetchWorkFlows: function (selectedTemplateName) {

            // if do not make this call WorkFlow tab remains disabled (not showing tab in this case anyway)
            if (Constants.SHOW_START_WORKFLOW) {

                this.fetchWorkFlowHandler.makeServerCallToFetchWorkFlows(selectedTemplateName);
            }

        },


        handleErrorResponse: function (response, actionForbiddenMessage) {

            this.showLoadingAnimation(false);

            if (DialogUtils.isSecurityDeniedResponse(response)) {  // unrecoverable (will have to re-login again)

                DialogUtils.showForbiddenDialog(actionForbiddenMessage);
                this.showInlineMessage(DialogUtils.createForbiddenInlineMessage(actionForbiddenMessage));

            } else {
                this.showInlineMessage(DialogUtils.createErrorInlineMessage(response));
            }
        },


        showInlineMessage: function (inlineMessage) {
            inlineMessage.attachTo(Utils.removeAllChildrenFromElement(this.getInlineMessageHolder()));
        },

        /**
         * This loading animation shall block out the whole page
         * whilst call is on-going (no access to top section buttons)
         *
         * @param isShow - if true the loader is displayed, otherwise it is destroyed
         */
        showLoadingAnimation: function (isShow, loadingMessage) {

            this.eventBus.publish(Constants.events.LOADING_EVENT, isShow, loadingMessage);
        },


        /* DOM interactions */


        getWorkFlowFormHolder: function () {
            return this.findElementByClassName("-workFlowForm");
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
            return this.getElement().find(".eaEsoCreateSlice-rWorkFlowRegion" + suffix);
        }
    });
});
