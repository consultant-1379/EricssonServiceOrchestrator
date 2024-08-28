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
 * Date: 20/12/17
 */
define([
    'jscore/core',
    'i18n!eso-commonlib/dictionary.json',
    './SelectWorkFlowHandler',

    'eso-commonlib/FormInputRegion',  // TODO only working with absolute path ??
    'eso-commonlib/AjaxService',
    'eso-commonlib/UrlConstants',
    'eso-commonlib/Constants',
    'eso-commonlib/Utils'


], function (core, Dictionary, SelectWorkFlowHandler, FormInputRegion, ajaxService, UrlConstants, Constants, Utils) {
    'use strict';

    /**
     * Types which always have to appear on the form
     * (along with the dynamic data loaded when choose a workflow)
     * @type {{workFlowName: *}}
     */
    var staticWorkFlowTypes = {
        workFlowName: Dictionary.createSlice.WORK_FLOW_NAME_LABEL_AND_ID
    };

    /**
     * Default empty workflow item (work flow not mandatory)
     * @type {{name: *, value: *, title: *}}
     */
    var workFlowNoneItem = {

        name: Dictionary.createSlice.WORK_FLOW_OPTION_NONE,
        value: Dictionary.createSlice.WORK_FLOW_OPTION_NONE,
        title: Dictionary.createSlice.WORK_FLOW_OPTION_NONE
    };


    /**
     *  Class to be shared both for when adding a workflow for "create slice use case" (PUSH)
     *  and for starting a workflow on an existing network slice (PUT), i.e.
     *
     * 1) Work Flow Tab - Create Network  Slice (instance)
     *    i.e. handling server calls, etc, associate with selecting a service template from from select box
     *    This will load both parameters for Details tab and make call to fetch work flows associate with the
     *    selected service template (this class makes the work flow call)
     *
     * 2) Start work flow dialog call with a pre-selected service template (blueprint, service model)
     */

    return core.AppContext.extend({


        init: function (options) {
            this.options = options ? options : {};

            this.eventBus = this.options.eventBus;
            this.getWorkFlowFormHolder = this.options.getWorkFlowFormHolder;
            this.showLoadingAnimation = this.options.showLoadingAnimation;
            this.handleErrorResponse = this.options.handleErrorResponse;
            this.isWorkFlowMandatory = (this.options.isWorkFlowMandatory) ? this.options.isWorkFlowMandatory : false;


            this.workFlowSelectionHandler = new SelectWorkFlowHandler({
                    setParametersInForm: this.setParametersInForm.bind(this),
                    hasUserSelectedWorkFlow: this.hasUserSelectedWorkFlow.bind(this),
                    eventBus: this.eventBus

                }
            );

        },

        handleCleanUpOnClose: function () {
            if (this.workFlowSelectionHandler) {
                this.workFlowSelectionHandler.handleCleanUpOnClose();
            }
            this.setToInitialState();
        },

        /**
         * Information required for "Save & Install" call
         */
        getWorkFlowName: function () {
            var workFlowName = this.workFlowSelectionHandler.getWorkFlowName();
            return (typeof workFlowName !== 'undefined') ? workFlowName : workFlowNoneItem.name;
        },

        /**
         * Information required for "Save & Execute" call
         */
        getWorkFlowInputs: function () {
            var data = this.workFlowInputRegion.getData();
            for (var key in staticWorkFlowTypes) {
                delete data[staticWorkFlowTypes[key]];
            }
            return Utils.removeNewLines(data);
        },


        isDirty: function () {
            return this.hasUserSelectedWorkFlow();
        },

        isValid: function (successFunction) {

            if (this.hasUserSelectedWorkFlow()) {
                return  this.checkUserInputAndCallSuccessFunction(successFunction);
            }
            return successFunction();
        },


        /**
         * Method to call when for "Save and Execute"
         *
         * @param successFunction  method to call if validation successful
         */
        checkUserInputAndCallSuccessFunction: function (successFunction) {
            this.workFlowInputRegion.isValid(successFunction);
        },

        /**
         * Load workflow list based on selected service template
         *
         * @param selectedTemplateName   service template (blueprint, model)
         */
        makeServerCallToFetchWorkFlows: function (selectedTemplateName) {

            this.setToInitialState();   // remove any existing selection for a change in service template

            var loadingMessage = Dictionary.loadingMessages.LOADING_WORK_FLOWS_FOR_SERVICE_TEMPLATE;
            loadingMessage = loadingMessage.replace("{0}", selectedTemplateName);
            this.showLoadingAnimation(true, loadingMessage);

            var workFlowsUrl = UrlConstants.serviceTemplates.WORKFLOWS_FOR_SERVICE_TEMPLATE;
            workFlowsUrl = workFlowsUrl.replace("{0}", selectedTemplateName);

            ajaxService.getCall({
                url: workFlowsUrl,
                success: this.onFetchWorkFlowsSuccess.bind(this),
                error: this.onFetchWorkFlowsError.bind(this, selectedTemplateName)
            });

        },

        onFetchWorkFlowsSuccess: function (response) {

            this.showLoadingAnimation(false);
            this.setWorkFlowsResponse(response);
        },

        onFetchWorkFlowsError: function (selectedTemplateName, model, response) {

            var forbiddenMessage = Dictionary.forbiddenActionMessages.LOAD_WORK_FLOWS_FOR_SERVICE_TEMPLATE;
            forbiddenMessage = forbiddenMessage.replace("{0}", selectedTemplateName);

            /* different handling if already a dialog (start work flow from dialog) */
            this.handleErrorResponse(response, forbiddenMessage);

        },


        /**
         * Handle work flow response when select service template
         * There is no extra server call to fetch workflow parameters, it is in
         * response of UrlConstants.serviceTemplates.WORKFLOWS_FOR_SERVICE_TEMPLATE
         *
         * @param serverWorkflowResponse   response for workflows associated with a selected service template, e.g.
         *
         * {  "execute_operation": {
         *          "mapping": "default_workflows.cloudify.plugins.workflows.execute_operation",
         *          "parameters": {
         *              "node_ids": {
         *                  "default": []
         *              },
         *          "node_instance_ids": {
         *          "default": []
         *          },
         *          "operation": {},
         *          "operation_kwargs": {
         *          "default": {}
         *          },
         *          "run_by_dependency_order": {
         *               "default": false
         *          },
         *          "type_names": {
         *              "default": []
         *              }
         *          }
         *      },
         *      "install":  {mapping: "workflowplugin.main.workflows.myinstall.install"}
         *      "uninstall":  {mapping: "default_workflows.cloudify.plugins.workflows.uninstall" }
         *      }
         * }
         *
         */
        setWorkFlowsResponse: function (serverWorkflowResponse) {

            var selectBoxItems = Utils.convertToSelectBoxItems(Object.keys(serverWorkflowResponse));

            this.eventBus.publish(Constants.events.WORK_FLOWS_AVAILABLE, selectBoxItems.length !== 0);  // nothing to show in select box

            if (this.isWorkFlowMandatory) {

                if (selectBoxItems.length === 0) {

                    return;
                }

            } else {
                selectBoxItems.unshift(workFlowNoneItem); // add "None" to start
            }


            var staticParams = this.getStaticWorkFlowParameters(selectBoxItems);
            this.setParametersInForm(staticParams);

            this.workFlowSelectionHandler.setWorkFlowCache(serverWorkflowResponse);

        },

        setParametersInForm: function (parameters) {

            if (!this.workFlowInputRegion) {
                this.workFlowInputRegion = new FormInputRegion({parameters: parameters});
                this.workFlowInputRegion.start(this.getWorkFlowFormHolder());

            } else {
                this.workFlowInputRegion.setParameters(parameters);
            }

        },

        /**
         * Reset to initial state to be called when
         * resume application
         */
        setToInitialState: function () {
            if (this.workFlowInputRegion) {
                this.workFlowInputRegion.detach();
                this.workFlowInputRegion.stop();
                delete this.workFlowInputRegion;
                this.eventBus.publish(Constants.events.WORK_FLOW_SELECTED, false); // no work flow now selected
            }
        },

        hasUserSelectedWorkFlow: function () {
            return (workFlowNoneItem.name !== this.getWorkFlowName());
        },


        getStaticWorkFlowParameters: function (workFlowItems) {
            var defParams = {};

            defParams[staticWorkFlowTypes.workFlowName] = {
                id: Dictionary.createSlice.WORK_FLOW_NAME_LABEL_AND_ID,
                type: "select",
                placeholder: Dictionary.createSlice.SELECT_FROM_LIST_PLACEHOLDER,
                items: workFlowItems,
                default: workFlowNoneItem.value,
                description: Dictionary.createSlice.WORK_FLOW_SELECT_BOX_DESCRIPTION,
                mandatory: this.isWorkFlowMandatory,
                callback: this.workFlowSelectionHandler.handleWorkFlowSelected.bind(this.workFlowSelectionHandler, defParams)
            };

            return defParams;
        }
    });
});
