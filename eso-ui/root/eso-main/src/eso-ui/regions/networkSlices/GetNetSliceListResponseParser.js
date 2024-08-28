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
 * Date: 19/01/18
 */
define([
    '../../Dictionary',
    'eso-commonlib/Constants'
], function (Dictionary, Constants) {

    /**
     * Class parsing response received from ESO server response to
     * list "Network slice" instances - URI : /eso-service/v1/service-instances
     */
    return {

        /**
         * Loop through server response for fetching network slices list
         * and return filtered result for Network Slices list display
         *
         *
         * @param response
         *
         * {
         *      "serviceInstanceName": "monday_2",
         *      "serviceInstanceId" : "9999",
         *      "initializationTime": "2018-01-15 15:23:02.338582",
         *      "serviceModelName": "hello",
         *      "inputs": null,
         *      "lastExecutedWorkflow": {
         *          "workflowName": "install",
         *          "startDateTime": "2018-01-15 15:23:29.451657",
         *          "endDateTime": "2018-01-15 15:23:37.077972",
         *          "status": 100,
         *          "executionState": 2,
         *          "errorDetails": ""
         * }
         * },
         * {
         *      "serviceInstanceName": "monday_3",
         *      "serviceInstanceId" : "3333",
         *      "initializationTime": "2018-01-15 15:26:44.747104",
         *      "serviceModelName": "monday-3",
         *      "inputs": null,
         *      "lastExecutedWorkflow": {
         *          "workflowName": "install",
         *          "startDateTime": "2018-01-15 16:33:19.570937",
         *          "endDateTime": "2018-01-15 16:33:27.270661",
         *          "status": 100,
         *          "executionState" 1,
         *          "errorDetails": ""
         * }
         * }
         *
         */
        parseNetworkSliceInfoForDisplay: function (responseData) {

            var parsedData = [];
            var lastExecutedWorkFlowServerData;

            for (var i = 0; i < responseData.length; i++) {

                lastExecutedWorkFlowServerData = getLastExecutedWorkflow(responseData[i]);  // can be {}

                parsedData.push({
                    networkSliceId: responseData[i].serviceInstanceId,
                    networkSliceName: responseData[i].serviceInstanceName,
                    executionState: getExecutionState(lastExecutedWorkFlowServerData),
                    progressStatus: getProgressStatus (lastExecutedWorkFlowServerData),
                    serviceTemplateName: responseData[i].serviceModelName,
                    errorDetails: getErrorDetails(lastExecutedWorkFlowServerData),
                    initializationTime: responseData[i].initializationTime,
                    workFlowName: getLastExecutedWorkFlowName(lastExecutedWorkFlowServerData)
                });
            }

            return parsedData;
        }
    };


    function getLastExecutedWorkflow(singleNetSliceServerData) {
        return (singleNetSliceServerData.lastExecutedWorkflow) ? singleNetSliceServerData.lastExecutedWorkflow : {};

    }

    function getExecutionState(lastExecutedWorkFlowServerData) {
        var executionState;

        if (!isEmptyOrUndefined(lastExecutedWorkFlowServerData)) {
            executionState = lastExecutedWorkFlowServerData.executionState;
        } else {
            executionState = Constants.executionStates.SUCCESS_EXECUTION_STATE;   // no work flow to report on
        }
        return executionState;
    }

    function getProgressStatus (lastExecutedWorkFlowServerData) {
        var executionState;

        if (!isEmptyOrUndefined(lastExecutedWorkFlowServerData)) {
            executionState = lastExecutedWorkFlowServerData.status;
        } else {
            executionState = 0;   // no work flow to report on
        }
        return executionState;
    }

    function getLastExecutedWorkFlowName(lastExecutedWorkFlowServerData) {

        var workFlowName;

        if (!isEmptyOrUndefined(lastExecutedWorkFlowServerData)) {

            workFlowName = lastExecutedWorkFlowServerData.workflowName;
        } else {
            workFlowName = Dictionary.NO_WORK_FLOW_EXECUTED_MESSAGE;
        }

        return workFlowName;
    }

    function getErrorDetails(lastExecutedWorkFlowServerData) {

        return lastExecutedWorkFlowServerData.errorDetails;
    }

    function isEmptyOrUndefined(obj) {      // TODO move to Utils if used more

        if (typeof obj !== 'undefined') {

            return (obj === '') || Object.keys(obj).length === 0;

        }
        return true;
    }

});