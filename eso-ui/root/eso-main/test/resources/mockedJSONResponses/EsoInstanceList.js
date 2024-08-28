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
if (typeof define !== 'function') {
    var define = require('../../../../node_modules/amdefine')(module);
}


define(function () {

    /**
     * simulated response from   eso-service/v1/service-instances
     * to list Network Slices
     *
     * (will expand this in server.js - to test high volume Network Slices, Empty, etc)
     *
     */

    return [
        {
            "serviceInstanceName": "Monday",
            "serviceInstanceId": "9999",
            "initializationTime": "2018-01-15 15:23:02",
            "serviceModelName": "massive-mtc",

            "lastExecutedWorkflow": {
                "workflowName": "install",
                "status": 22,
                "executionState": 2,    // failed
                "errorDetails": "Failed to execute install workflow for deployment id thurs. ERROR: Workflow failed: Task failed 'main.vnflaf.client.startwf' -> VNF-LAF workflow with instance id [69bd812a-d5ea-11e7-98db-fa163e0f6356] and definition name [Instantiate EPG Node] has failed"
            }
        }
    ];


});

