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
    'eso-commonlib/Utils',
    'eso-commonlib/Constants'

], function (core, Dictionary, Utils, Constants) {
    'use strict';

    /**
     * This class is handling displaying parameters
     * after select a workflow from drop down list of workflows
     *
     * (work inputs (parameters) are cached without making new server calls for the create network slice use case)
     *
     * publishes : Constants.events.WORK_FLOW_SELECTED
     */

    return core.AppContext.extend({


        /**
         *
         * @param options
         *          setParametersInForm: this.setParametersInForm.bind(this),
         *          hasUserSelectedWorkFlow: this.hasUserSelectedWorkFlow.bind(this),
         *          eventBus: this.getEventBus()
         */
        init: function (options) {
            this.options = options ? options : {};

            this.setParametersInForm = options.setParametersInForm;
            this.hasUserSelectedWorkFlow = options.hasUserSelectedWorkFlow;
            this.eventBus = options.eventBus;

        },

        handleCleanUpOnClose: function () {
            delete this.workFlowCache;
        },

        getWorkFlowName: function () {
            return this.workFlowName;
        },


        /**
         * Handle item selected in work flow select box
         * Must change content of form to show parameters, if any, associated with the work flow.
         *
         * Change the name on the Create button to include  "Execute" if adding a workflow at this point
         *
         * @param staticParams   static parameters in form (work flow select box items)
         * @param workFlowName   name of work flow selected in drop down
         */
        handleWorkFlowSelected: function (staticParams, workFlowName) {

            this.workFlowName = workFlowName;
            this.setParametersInForm(this.getWorkflowParametersForName(staticParams, workFlowName));

            // e.g. subscribe to change context menu in TopSection
            this.eventBus.publish(Constants.events.WORK_FLOW_SELECTED, this.hasUserSelectedWorkFlow());

        },

        /**
         * There is no extra server call to fetch workflow parameters, it is in
         * response of UrlConstants.serviceTemplates.WORKFLOWS_FOR_SERVICE_TEMPLATE
         *
         * @param workFlowCache   response for workflows associated with a selected service template, e.g.
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
        setWorkFlowCache: function (workFlowCache) {
            this.workFlowCache = workFlowCache;

        },

        getWorkflowParametersForName: function (workFlowParameters, workFlowName) {

            var numberOfWorkFlows = Object.keys(this.workFlowCache).length;

            var nameLabel = Dictionary.createSlice.WORK_FLOW_NAME_LABEL_AND_ID;

            /*  workFlowParameters could have been altered on previous selection */
            Utils.deleteKeysInJavaScriptObjectExceptKeys(workFlowParameters, [nameLabel]);

            outside: for (var i = 0; i < numberOfWorkFlows; i++) {
                for (var currentWorkFlowName in this.workFlowCache) {
                    if (this.workFlowCache.hasOwnProperty(currentWorkFlowName) && currentWorkFlowName === workFlowName) {

                        workFlowParameters[nameLabel].default = workFlowName;

                        for (var param in this.workFlowCache[currentWorkFlowName].parameters) {
                            workFlowParameters[param] = this.workFlowCache[currentWorkFlowName].parameters[param];
                            workFlowParameters[param].mandatory = true;
                        }
                        break outside;
                    }
                }
            }
            return workFlowParameters;
        }
    });
});
