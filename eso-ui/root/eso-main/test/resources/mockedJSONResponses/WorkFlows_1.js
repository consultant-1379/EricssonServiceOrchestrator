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
 * Date: 12/12/17
 */
if (typeof define !== 'function') {
    var define = require('../../../../node_modules/amdefine')(module);
}


define(function () {

    /**
     * simulated response from  /eso-service/v1/service-models/{{blueprintName}/workflows
     *
     * TODO NOTE : NOT Implemented by server to date
     */
    return {
        "my_install": {
            "mapping": "workflowplugin.main.workflows.myinstall.installX"
        },
        "node_other": {
            "mapping": "default_workflows.cloudify.plugins.workflows.execute_operation",
            "parameters": {
                "allow_kwargs_override": {
                    "default": false
                },
                "node_ids": {
                    "default": []
                },
                "node_instance_ids": {
                    "default": []
                },
                "operation": {
                    "default": "ericsson.nslcm.node.initialise",
                    "description": "hello",
                    "type": "string"
                },
                "operation_kwargs": {
                    "default": {}
                },
                "run_by_dependency_order": {
                    "default": true,
                    "type": "boolean"
                },
                "type_names": {
                    "default": []
                }
            }
        }
    }


});
