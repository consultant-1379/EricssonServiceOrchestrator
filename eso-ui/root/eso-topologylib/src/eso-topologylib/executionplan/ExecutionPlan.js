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
 * Date: 12/02/18
 */
define([
    'jscore/core',
    'container/api',
    'jscore/ext/privateStore',
    'uit!./ExecutionPlan.html',
    '../Dictionary',

    './executionplanDetails/ExecutionPlanDetails',

    'layouts/AdvancedWizardTimeline',
    'widgets/Loader',
    'widgets/InfoPopup',

    'eso-commonlib/AjaxService',
    'eso-commonlib/Constants',
    'eso-commonlib/DialogUtils',
    'eso-commonlib/JsonDisplayer',
    'eso-commonlib/UrlConstants',
    'eso-commonlib/Utils'


], function (core, container, PrivateStore, View, Dictionary, ExecutionPlanDetails, TimeLine, Loader, InfoPopup, ajaxService, Constants, DialogUtils, JsonDisplayer, UrlConstants, Utils) {
    'use strict';

    /**
     * Widget showing Execution Plan for a Selected Network Slice.
     *  The plan is shown horizontally - using client SDK  AdvancedWizardTimeline
     *
     * Loads an Execution plan and is updated (indirectly) though repeated (poll) calls
     *
     * Menu option (and clicking on plan step) opens a flyout for ExecutionPlanDetails
     *
     */

    var _ = PrivateStore.create();

    return core.Widget.extend({

            view: function () {
                return new View({DETAILS_MENU_TOOLTIP: Dictionary.EXECUTION_PLAN_DETAILS_MENU_TOOLTIP});
            },

            init: function (options) {
                this.options = (options) ? options : {};
                _(this).netSliceItem = this.options.netSliceItem;
            },

            onViewReady: function () {
                this.setTitleText();
                this.makeServerCallToFetchExecutionPlan(false);

            },

            onDestroy: function () {

                this.destroyExecutionPlanMenuIcon();
                this.destroyTimeLine();
            },

            /**
             * Poll server (currently polling to fetch data again
             * from network slice polling success)
             *
             * Don't to anything if consider that all steps are complete
             */
            upDateExecutionPlan: function () {

                if (!this.isAllStepsCompletePreviously(this.steps)) {

                    this.makeServerCallToFetchExecutionPlan(true);
                }
            },

            isAllStepsCompletePreviously: function (steps) {

                if (Utils.isDefined(steps)) {

                    for (var i = 0; i < steps.length; i++) {
                        if (!steps[i].complete) {
                            return false;
                        }
                    }
                    return true;
                }
                return false;

            },

            setTitleText: function () {
                var title = Dictionary.titles.EXECUTION_PLAN;
                title = title.replace("{0}", _(this).netSliceItem.networkSliceName);
                this.getTitleHolder().setText(title);

            },

            makeServerCallToFetchExecutionPlan: function (isPolling) {

                var loadingMsg, urlToCall;

                if (!isPolling) {
                    loadingMsg = Dictionary.loadingMessages.LOADING_EXECUTION_PLAN;
                    loadingMsg = loadingMsg.replace("{0}", _(this).netSliceItem.networkSliceName);
                    this.showLoadingAnimation(true, loadingMsg);

                }

                urlToCall = UrlConstants.network_slices.EXECUTION_PLAN;
                urlToCall = urlToCall.replace("{0}", _(this).netSliceItem.networkSliceId);

                ajaxService.getCall({
                    url: urlToCall,
                    success: this.onFetchExecutionPlanSuccess.bind(this, isPolling),
                    error: this.onFetchExecutionPlanError.bind(this)
                });
            },


            /**
             * Server call to fetch current state of plan
             * @param response    format:
             *
             * Server will add extra data : but require these ones (id, title, complete) to be able to use
             * the client SDK widget directly
             *
             *  {
             *      current: 'step1',
             *      steps: [
             *      {
             *         id: 'step1',
             *         title: 'This is the first step',
             *         complete: true
             *      },
             *      {
             *          id: 'step2',
             *          title: 'This is the second step',
             *          complete: true
             *      }
             *
             *       {
             *       "id": "step5",           // example (only) of extra information
             *       "name": "configure",
             *       "type": "Node",
             *       "title": "configure: fm-node-1",
             *       "node": "fm-node-1",
             *       "implementation": "scripts/configure_fm_node.py",
             *       "inputs": [{
             *          "name": "fm-node-ip",
             *          "value": "10.0.0.1",
             *          "type": "string"
             *        }],
             *        "complete": false
             *        }
             *      ]
             *  }
             */
            onFetchExecutionPlanSuccess: function (isPolling, response) {

                this.recreateExecutionPlan(response);

                this.setupDetailsMenuIcon(true);

                this.showLoadingAnimation(false);

            },


            onFetchExecutionPlanError: function (model, response) {

                this.showLoadingAnimation(false);
                this.setupDetailsMenuIcon(false);

                if (DialogUtils.isSecurityDeniedResponse(response)) {  // unrecoverable (will have to re-login again)

                    DialogUtils.showForbiddenDialog(Dictionary.forbiddenActionMessages.VIEW_EXECUTION_PLAN);
                    this.showInlineMessage(DialogUtils.createForbiddenInlineMessage(Dictionary.forbiddenActionMessages.VIEW_EXECUTION_PLAN));

                } else {

                    this.showInlineMessage(DialogUtils.createErrorInlineMessage(response));
                }
            },

            /**
             * Assuming something in the details data can change with each poll (just in case)
             * @param isShow

             */
            setupDetailsMenuIcon: function (isShow) {

                this.destroyExecutionPlanMenuIcon();

                if (isShow) {
                    if (typeof this.detailMenuIcon === 'undefined') {
                        this.detailMenuIcon = this.getExecutionPlanDetailsIcon();
                        this.detailsMenuEventId = this.detailMenuIcon.addEventHandler("click", this.showExecutionPlanDetailsFlyOut.bind(this));
                    }
                    this.recreateExecutionPlanDetails();

                }
                Utils.showElementInlineBlock(this.detailMenuIcon, isShow);

            },

            destroyExecutionPlanMenuIcon: function () {

                if (this.detailMenuIcon && this.detailsMenuEventId) {
                    this.detailMenuIcon.removeEventHandler(this.detailsMenuEventId);
                    delete this.detailMenuIcon;
                }
            },


            /**
             * If the flyout is open do we refresh its data (all expanded as before),
             * Also refresh data every time open flyout ( ExecutionPlanDetails)
             */
            recreateExecutionPlanDetails: function () {

                if (typeof this.executionPlanDetails === 'undefined') {

                    this.executionPlanDetailsContent = new ExecutionPlanDetails({
                            steps: this.steps,
                            isAllStepsCompletePreviously: this.isAllStepsCompletePreviously}   // could have this method in ExecutionPlanDetails too but less duplication
                    );

                    this.executionPlanDetails = {
                        header: Dictionary.titles.EXECUTION_PLAN_DETAILS_TITLE,
                        width: '600px',
                        content: this.executionPlanDetailsContent
                    };
                } else {
                    this.executionPlanDetailsContent.updateSteps(this.steps);
                }

            },


            recreateExecutionPlan: function (serverResponse) {
                // TODO https://confluence-nam.lmera.ericsson.se/display/JCF/AdvancedWizardTimeline+support+for+CLICK_MODE.ALL
                // TODO Setter methods on TimeLine not clearing existing current (layouts version 1.8.6) - recreating instead
                // TODO click handler only on completed steps

                // could be updating info for steps
                this.steps = serverResponse.steps;


                var timeLineStepInfo = this.getStepInfoUsedByTimeLine();

                // TODO try changing to below when client SDK bug fixed
//                if (typeof this.timeLine === 'undefined') {
//                    this.timeLine = new TimeLine({
//                        clickMode: TimeLine.CLICK_MODE.ALL,   // ALL is not working   !!! (has to be complete for click to work)
//                        current: serverResponse.current,
//                        steps: timeLineStepInfo
//                    });
//                    // this.timeLine.setClickMode(TimeLine.CLICK_MODE.ALL);
//                    this.timeLineEventId = this.timeLine.addEventHandler("click", this.showExecutionPlanDetailsFlyOutWithStepId.bind(this));
//                    this.timeLine.attachTo(this.getTimeLineHolder());
//                } else {
//                    this.timeLine.setCurrent(serverResponse.current);
//
//                    for (var i = 0; i < timeLineStepInfo.length; i++) {
//                        this.timeLine.setStepComplete(timeLineStepInfo[i].id, timeLineStepInfo[i].complete);
//                    }
//
//                }


                var replaceTimeLine = new TimeLine({
                    clickMode: TimeLine.CLICK_MODE.ALL,   // ALL is not working
                    current: serverResponse.current,
                    steps: timeLineStepInfo
                });

                replaceTimeLine.attachTo(this.getTimeLineHolder());

                this.destroyTimeLine();

                this.timeLine = replaceTimeLine;
                this.timeLineEventId = this.timeLine.addEventHandler("click", this.showExecutionPlanDetailsFlyOutWithStepId.bind(this));

                this.timeLine.scrollToStep(serverResponse.current);

            },

            destroyTimeLine: function () {
                if (this.timeLine) {   // destroy as not getting update methods (#setCurrent) in layouts "1.8.6" API to work

                    if (this.timeLineEventId) {
                        this.timeLine.removeEventHandler(this.timeLineEventId);
                    }
                    this.timeLine.detach();
                    this.timeLine.destroy();
                    delete this.timeLine;
                }
            },


            getStepInfoUsedByTimeLine: function () {
                var timeLineStepInfo = [];
                for (var i = 0; i < this.steps.length; i++) {
                    timeLineStepInfo.push({
                        id: this.steps[i].id,
                        title: this.steps[i].title,
                        complete: this.steps[i].complete
                    });
                }
                return timeLineStepInfo;

            },

            showExecutionPlanDetailsFlyOutWithStepId: function (selectedStepId) {

                if (selectedStepId) {
                    this.executionPlanDetailsContent.expandOneTreeItemOnly(selectedStepId);
                }
                container.getEventBus().publish('flyout:show', this.executionPlanDetails);

            },

            /**
             * When open the flyout via menu,
             * will collapse all  (nice to have a quick collapse all)
             */
            showExecutionPlanDetailsFlyOut: function () {
                this.executionPlanDetailsContent.collapseAll();
                container.getEventBus().publish('flyout:show', this.executionPlanDetails);

            },

            showInlineMessage: function (inlineMessage) {

                if (Utils.isDefined(this.timeLine)) {
                    this.timeLine.detach();
                    delete this.timeLine;
                }

                Utils.removeAllChildrenFromElement(this.getInlineMessageHolder());
                inlineMessage.attachTo(this.getInlineMessageHolder());
            },


            /* Loading life cycle */

            /**
             * This loading animation shall block out
             * the execution plan widget  (don't show when polling for update)
             *
             * @param isShow - if true the loader is displayed, otherwise it is destroyed
             */
            showLoadingAnimation: function (isShow, loadingMsg) {
                if (isShow) {

                    this.createLoadingAnimation(loadingMsg);
                } else {
                    this.destroyLoadingAnimation();
                }
            },

            createLoadingAnimation: function (loadingMessage) {
                if (typeof this.loader === 'undefined') {
                    this.loader = new Loader({
                            loadingText: loadingMessage }
                    );
                    this.loader.attachTo(this.getTimeLineHolder());
                }
            },

            destroyLoadingAnimation: function () {
                if (typeof this.loader !== 'undefined') {
                    this.loader.destroy();
                    delete this.loader;
                }
            },


            /* DOM interaction */

            getTitleHolder: function () {
                return this.findElementByClassName("-title");
            },

            getTimeLineHolder: function () {
                return this.findElementByClassName("-timeLine");
            },

            getExecutionPlanDetailsIcon: function () {
                return this.findElementByClassName("-menuIcon");
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
                return this.getElement().find(".elEsoTopologylib-wExecutionPlan" + suffix);
            }
        }
    );


});
