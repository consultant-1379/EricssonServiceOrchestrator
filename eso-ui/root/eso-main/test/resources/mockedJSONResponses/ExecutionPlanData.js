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
if (typeof define !== 'function') {
    var define = require('../../../../node_modules/amdefine')(module);
}


define(function () {

    /**
     *
     * TODO to be defined
     * simulated response from   eso-service/v1/service-instances/:serviceInstanceId/executionPlan
     * to retrieve execution plan
     *
     * (will expand this in server.js - to test changing steps)
     *
     */

    return {
        current: "step0",
        steps: [
            {
                id: "step0",
                name: "create",
                type: "Node",
                title: "create: fm-block-storage-1",
                node: "fm-block-storage-1",
                implementation: "scripts/create_storage.py",
                inputs: [
                    {
                        name: "size",
                        value: "1",
                        type: "integer"
                    }
                ],
                complete: false
            },
            {
                id: "step1",
                "name": "configure",
                "type": "Node",
                "title": "configure: fm-block-storage-1",
                "node": "fm-block-storage-1",
                "implementation": "scripts/configure_storage.py",
                "inputs": []
            },
            {
                id: "step2",
                "name": "start",
                "type": "Node",
                "title": "start: fm-block-storage-1",
                "node": "fm-block-storage-1",
                "implementation": "",
                "inputs": [],
                "complete": false
            },
            {
                id: "step3",
                "name": "create",
                "title": "create: fm-node-1",
                "type": "Node",
                "node": "fm-node-1",
                "implementation": "scripts/create_fm_node.py",
                "inputs": [],
                "complete": false
            },
            {
                id: "step4",
                "name": "configure",
                "type": "Node",
                "random": [
                    {
                        "random1": "configure1",
                        "random2": [
                            {
                                "name": "random2 nest fm-node-ip",
                                "value": "random2 nest  10.0.0.1",
                                "type": "random2 nest  string"
                            }
                        ],
                        "random3": "configure3"
                    }
                ],
                "title": "configure: fm-node-1",
                "node": "fm-node-1",
                "implementation": "scripts/configure_fm_node.py",
                "inputs": [
                    {
                        "name": "fm-node-ip",
                        "value": "10.0.0.1",
                        "type": "string"
                    }
                ],
                "complete": false
            },
            {
                id: "step5",
                "name": "start",
                "type": "Node",
                "title": "start: fm-node-1",
                "node": "fm-node-1",
                "implementation": "scripts/start_fm_node.py",
                "inputs": [],
                "complete": false
            },
            {
                id: "step6",
                "name": "add_target",
                "type": "Relationship",
                "title": "add_target: fm-node-1 <- fm-block-storage-1",
                "target_node": "fm-block-storage-1",
                "implementation": "scripts/attach_fm_storage.py",
                "inputs": [],
                "complete": false
            }
        ]
    }


});


