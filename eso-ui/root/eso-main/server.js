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
 */

const util = require('util');

const serviceTemplatesGridData = require('./test/resources/mockedJSONResponses/ServiceTemplatesGridData.js');

const esoNetworkSliceList = require('./test/resources/mockedJSONResponses/EsoInstanceList.js');
const esoTemplateInputs_1 = require('./test/resources/mockedJSONResponses/EsoTemplateInputs_1.js');
const workflows_1 = require('./test/resources/mockedJSONResponses/WorkFlows_1.js');
const esoExecutionPlan = require('./test/resources/mockedJSONResponses/ExecutionPlanData.js');


/**
 * This is the "mock" (fake) server used to test and develop  UI with expected JSON responses
 * a real server might send.
 *
 * It can be run using the script in the scripts folder  (./runServer.sh without a proxy).
 *
 *
 * @param app  Read about Node.js and Express
 */
module.exports = function (app) {


    var ESO_REST_PREFIX_VERSION = "/eso-service/v1";


    ///////////////////////////////////////////////////////////////////////////////////////////////
    /////////////// Network Slice Management  /////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * GET: List network slices instances
     */
    app.get(ESO_REST_PREFIX_VERSION + "/service-instances", function (req, res) {
        res.set('Content-Type', 'application/json');
        var failTheCall = false;  // change at will

        if (!failTheCall) {

            if (typeof this.networkSlicesListResults == 'undefined') {

                var networkSlicesListResultValues = [];
                var DESIRED_NUMBER_OF_SLICES = 99;   // TODO change this at will (or -1 not to change from  esoNetworkSliceList)

                if (DESIRED_NUMBER_OF_SLICES !== -1) {


                    var rootItem = esoNetworkSliceList[0];
                    var results = [];
                    var nextItem;

                    for (var i = 0; i < DESIRED_NUMBER_OF_SLICES; i++) {

                        nextItem = JSON.parse(JSON.stringify(rootItem));
                        nextItem.serviceInstanceName = rootItem.serviceInstanceName + "__" + i;
                        nextItem.serviceInstanceId = "" + i;


                        if ((Math.floor(Math.random() * (4)) + 1) == 2) {
                            delete nextItem.lastExecutedWorkflow;
                        } else {
                            nextItem.lastExecutedWorkflow = JSON.parse(JSON.stringify(rootItem.lastExecutedWorkflow));
                            nextItem.lastExecutedWorkflow.executionState = (Math.floor(Math.random() * (3))); /// (between 0 and 2 incl) - only one work flow in deploymentList 0
                            if (0 == nextItem.lastExecutedWorkflow.executionState) {
                                nextItem.lastExecutedWorkflow.status = (Math.floor(Math.random() * (100)));
                            } else {
                                nextItem.lastExecutedWorkflow.status = 100;
                            }

                        }

                        results.push(nextItem);
                    }

                    networkSlicesListResultValues = results;

                } else {
                    networkSlicesListResultValues = esoNetworkSliceList;

                }

                // create a "map" with ids for the slice instances (so can use for delete functionality)
                this.networkSlicesListResults = {};
                for (var i = 0; i < networkSlicesListResultValues.length; i++) {
                    this.networkSlicesListResults [networkSlicesListResultValues[i].serviceInstanceId] = networkSlicesListResultValues[i];
                }
            }

            // sort every time in case added or deleted items
            var sortedResults = getObjectValues(this.networkSlicesListResults).sort(compareByServiceInstanceName);

            res.send(JSON.stringify(sortedResults));


        } else {
            throwAnErrorToUI(res, 503);   // Testing no Service


        }
    });


    /**
     * POST : Create network slice instance
     */
    app.post(ESO_REST_PREFIX_VERSION + "/service-instances", function (req, res) {
        res.set('Content-Type', 'application/json');
        var failTheCall = false;  // change at will
        if (!failTheCall) {
            var rootItem = esoNetworkSliceList[0];
            var newItem = JSON.parse(JSON.stringify(rootItem));

            // undefined if went directly to create slice hash

            var assignedServiceInstanceId = (typeof this.networkSlicesListResults !== 'undefined') ? "" + Object.keys(this.networkSlicesListResults).length + 1 : "" + Math.floor(Math.random());

            var foundServiceTemplate = this.currentServiceTemplateScaledItems [req.body.serviceModelId];  // currentServiceTemplateScaledItems is a "Map"
            var serviceModelName;
            if (typeof foundServiceTemplate != 'undefined') {
                serviceModelName = foundServiceTemplate.name;
            } else {
                serviceModelName = req.body.serviceModelId; // fake server can show bad data
            }

            newItem.serviceInstanceName = req.body.name;
            newItem.serviceInstanceId = assignedServiceInstanceId;
            newItem.initializationTime = new Date().toISOString();  // assuming server will now start install
            newItem.serviceModelName = serviceModelName;


            this.networkSlicesListResults [newItem.serviceInstanceId] = newItem;

            res.send(JSON.stringify("Request Accepted"));
        } else {

            throwAnErrorToUI(res, 500, "ESO_TEST_EXCEPTION_FROM_SERVER");
        }

    });

    /**
     * DELETE : Delete network slice    TODO we should consider supporting multiple delete instead
     */
    app.delete(ESO_REST_PREFIX_VERSION + "/service-instances/:networkSliceId", function (req, res) {
        res.set('Content-Type', 'application/json');
        var failTheCall = false;  // change at will
        if (!failTheCall) {

            var id = req.params.networkSliceId;
            delete this.networkSlicesListResults [id];

            res.send(JSON.stringify("Request Accepted"));
        } else {
            throwAnErrorToUI(res, 500);
        }

    });


    /**
     * TODO  Note Start workflow not part of any real server to date
     * PUT : NOT implemented in Real Server but keeping code for now.
     * (start work flow on network slice)
     */
    app.put(ESO_REST_PREFIX_VERSION + "/service-instances/:networkSliceName", function (req, res) {
        res.set('Content-Type', 'application/json');
        var failTheCall = false;  // change at will
        if (!failTheCall) {

            res.send(JSON.stringify("Request Accepted"));
        } else {
            throwAnErrorToUI(res, 500);
        }
    });


    app.get(ESO_REST_PREFIX_VERSION + "/service-instances/:serviceInstanceId/executionPlan", function (req, res) {
        res.set('Content-Type', 'application/json');
        var failTheCall = false;  // change at will

        if (!failTheCall) {
            if (typeof this.currentExecutionPlanStep == 'undefined'){
                this.currentExecutionPlanStep = 0;
            } else {
                if (this.currentExecutionPlanStep <= 6){  // see ExecutionPlanData 7 steps
                    this.currentExecutionPlanStep = this.currentExecutionPlanStep + 1;  // every poll
                }

            }

            esoExecutionPlan.current =  "step"+this.currentExecutionPlanStep;  // id
            console.log("Updating execution plan step current to "  + esoExecutionPlan.current);


            for (var i=0; i < esoExecutionPlan.steps.length; i++ ){
                esoExecutionPlan.steps[i].complete =  this.currentExecutionPlanStep > i;
            }

            res.send(JSON.stringify(esoExecutionPlan));
        } else {
            throwAnErrorToUI(res, 500);
        }
    });


    ///////////////////////////////////////////////////////////////////////////////////////////////
    /////////////// Service Template Management  //////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////

    /**
     *
     * e.g. esoservice/v1/service-models?offset=0&limit=50sortAttr=name&sortDir=asc&filters={}
     *
     * To suit client SDK paginated layout, would want our
     * server to sent response, like
     *   {
     *            total: 9000
     *            items: []
     *    }
     *
     * GET : List batched grid information for service template table (blueprints, models)
     *
     * (can be passed without off-set etc if being used to display servive model names)
     *
     */
    app.get(ESO_REST_PREFIX_VERSION + "/service-models", function (req, res) {

        var DESIRED_NUMBER_OF_RECORDS = 5001;  // TODO change at will (service templates)

        if (typeof this.currentServiceTemplateScaledItems == 'undefined') {
            this.currentServiceTemplateScaledItems = scaleItems(serviceTemplatesGridData, DESIRED_NUMBER_OF_RECORDS);
        }


        var mapValues = getObjectValues(this.currentServiceTemplateScaledItems);

        return sendPaginatedData(req, res, mapValues);
    });

    /**
     * Required paginated grid layout call 2 (for service templates paginated grid)
     */
    app.get(ESO_REST_PREFIX_VERSION + "/service-model-ids", function (req, res) {
        res.set('Content-Type', 'application/json');

        var failTheCall = false;  // change at will

        if (!failTheCall) {
            res.send(getAllIds(this.currentServiceTemplateScaledItems));
        } else {
            throwAnErrorToUI(res, 500);
        }
    });


    /**
     * DELETE Service Template(s) - takes IDs in the body of the rest
     */
    app.delete(ESO_REST_PREFIX_VERSION + "/service-models", function (req, res) {
        res.set('Content-Type', 'application/json');
        var failTheCall = false;  // change at will

        if (!failTheCall) {

            console.log("request body for delete : " + util.inspect(req.body));

            var errorOccurred = false;

            for (var j=0; j < req.body.length; j++){
                var idToDelete = req.body[j];
                console.log("Attempting to delete : " + util.inspect(idToDelete));

                if (this.currentServiceTemplateScaledItems[idToDelete]) {
                    delete this.currentServiceTemplateScaledItems[idToDelete];
                } else {
                    errorOccurred = true;
                    console.log("Failed to delete id: " + idToDelete + " this.currentServiceTemplateScaledItems[" + idToDelete + "] is " + this.currentServiceTemplateScaledItems[idToDelete]);
                }
            }

            if (!errorOccurred) {
                res.send(JSON.stringify("Request Accepted"));
            } else {
                throwAnErrorToUI(res, 500);
            }

        } else {
            throwAnErrorToUI(res, 500);
        }
    });


    /**
     * List inputs for particular service template
     */
    app.get(ESO_REST_PREFIX_VERSION + "/service-models/:serviceTemplate_Id/inputs", function (req, res) {
        res.set('Content-Type', 'application/json');
        var failTheCall = false;  // change at will

        if (!failTheCall) {

            res.send(JSON.stringify(esoTemplateInputs_1));
        } else {
            throwAnErrorToUI(res, 500);
        }
    });


    /**
     * TODO  Note Start workflow not part of any real server to date
     *
     * List workflows (and their parameters) for particular service template
     */
    app.get(ESO_REST_PREFIX_VERSION + "/service-models/:serviceTemplate_id/workflows", function (req, res) {
        res.set('Content-Type', 'application/json');

        var failTheCall = false;  // change at will

        if (!failTheCall) {
            res.send(JSON.stringify(workflows_1));
        } else {
            throwAnErrorToUI(res, 500);
        }
    });


    /**
     *  Upload : Install Service Template uses case passing yaml file
     */
    app.post(ESO_REST_PREFIX_VERSION + "/service-models", function (req, res) {
        res.set('Content-Type', 'application/json');
        var failTheCall = false;  // change at will


        if (!failTheCall) {
            console.log("Install Received: " + util.inspect(req.files));
            var selectedName = req.body.name;
            var description = req.body.description;

            console.log("selectedName " + selectedName);

            // Test only (perhaps will do this UI side instead
            if (selectedName === 'massive-mtc') {
                throwAnErrorToUI(res, 500, "SERVICE_TEMPLATE_NAME_ALREADY_EXISTS");
            } else {

                var fileName = req.files['file'].originalname;

                var ids = Object.keys(this.currentServiceTemplateScaledItems);
                var index = ids.length + 1;

                var newRowItem = {};
                var newRowId = "081a7fea-d142-4b26-9f6c-3da2cd29e82d" + "-" + index;

                newRowItem.name = selectedName;
                newRowItem.id = newRowId;
                newRowItem.description = description,
                    newRowItem.service_template_file_name = fileName;
                newRowItem.upload_time = new Date().toISOString();


                this.currentServiceTemplateScaledItems [ newRowId] = newRowItem;

                res.send(JSON.stringify("Request Accepted for installing " + selectedName  + ", assigning id "+newRowId));
            }


        } else {
            throwAnErrorToUI(res, 500);
        }

    });

    //////////////  Util functions for fake server  /////////////////////////////////////////////

    function getObjectValues(objMap) {
        // Object.values does not seem to exist in this version of Node.js

        var values = Object.keys(objMap).map(function (e) {
            return objMap[e]
        });
        return values;

    }


    function compareByServiceInstanceName(a, b) {


        var compareA = (a.serviceInstanceName) ? a.serviceInstanceName.toUpperCase() : a.serviceInstanceName;
        var compareB = (b.serviceInstanceName) ? b.serviceInstanceName.toUpperCase() : b.serviceInstanceName;

        return compareArgs(compareA, compareB);
    }


    function compareArgs(compareA, compareB) {


        if (compareA < compareB)
            return -1;
        if (compareA > compareB)
            return 1;
        return 0;
    }


    function sendPaginatedData(req, res, scaledItems) {
        res.set('Content-Type', 'application/json');


        var failTheCall = false;  // change at will


        var potentiallyFilteredAndSorted;

        if (req.query.filters && req.query.sortAttr) {   // Can make call with no parameters for fetching Service Templates for selection list
            var filteredItems = applyFilters(scaledItems, req.query.filters);
            potentiallyFilteredAndSorted = applySort(filteredItems, req.query.sortAttr, req.query.sortDir);
        } else {
            potentiallyFilteredAndSorted = scaledItems;
        }


        var totalItemsLength = potentiallyFilteredAndSorted.length;

        var offset = (req.query.offset) ? parseInt(req.query.offset) : 0;
        var limit = (req.query.limit) ? parseInt(req.query.limit) : totalItemsLength;
        var max = ((offset + limit) > totalItemsLength) ? totalItemsLength : (offset + limit);

        var batchedItems = potentiallyFilteredAndSorted.slice(offset, max);
        console.log("!!!! Paginated grid call : req.offset: " + offset + " req.limit: " + limit + " returning batch from " + offset + " to " + max);

        // TESTING empty to full grid
        //failTheCall =  (offset > 150);  // page 8 if 5000
        //failTheCall =  (offset == 0);  // first call


        var response;
        if (!failTheCall) {

            response = {
                items: batchedItems,    // noting SDK will want "items"  (an empty array back will not be liked)
                total: potentiallyFilteredAndSorted.length
            }

            res.send(JSON.stringify(response));

        } else {
            throwAnErrorToUI(res, 500);
        }
    }


    function applySort(items, sortAttr, sortDir) {
        console.log("Applying sorting on column " + sortAttr + ", direction " + sortDir);

        // assume strings
        function ascComparator(item1, item2) {

            if (item1 [sortAttr] != null) {
                return item1 [sortAttr].localeCompare(item2[sortAttr]);
            }
            return (item2[sortAttr] == null ? 0 : 1);


        }

        function descendingComparator(item1, item2) {
            if (item2 [sortAttr] != null) {
                return item2 [sortAttr].localeCompare(item1[sortAttr]);
            }
            return (item1[sortAttr] == null ? 0 : -1);

        }


        if (sortDir == 'asc') {
            items = items.sort(ascComparator);
        } else {
            items = items.sort(descendingComparator);
        }

        return items;

    }


    function applyFilters(items, filterPassedToServer) {

        var filters = JSON.parse(filterPassedToServer); // convert URL parameter String to real JSON
        var filterKeys = Object.keys(filters);

        if (filterKeys.length == 0 && filters.constructor == Object) {
            console.log("Not applying filter : " + filterPassedToServer);
            return items;  // no filters
        }
        console.log("Applying filter : " + filterPassedToServer);

        var filteredResult = items.filter(function (item) {

            for (var i = 0; i < filterKeys.length; i++) {
                var columnItemText = item[filterKeys[i]] != null ? item[filterKeys[i]] : "";
                if (columnItemText.indexOf(filters[filterKeys[i]]) == -1) {
                    return false;
                }

            }
            return true;  // must satisfy ALL in filter
        });

        return filteredResult;
    }

    /**
     * Scale Items into a Id - item Map
     * @param baseJSON
     * @param desiredRecordCount
     * @returns {{}}
     */
    function scaleItems(baseJSON, desiredRecordCount) {

        var itemMap = {};

        if (desiredRecordCount > 0) {
            var item;

            var baseItem = JSON.parse(JSON.stringify(baseJSON[0]))
            var nameKey = (baseItem.name) ? "name" : "plugin_name";

            // add the base (to test create slice with value

            itemMap [baseItem.id] = baseItem;
            for (var i = 1; i < desiredRecordCount; i++) {

                item = JSON.parse(JSON.stringify(baseJSON[0]));
                item[nameKey] = item[nameKey] + "-" + i;
                item.id = item.id + '-' + i;

                itemMap [item.id] = item;

            }
        }
        return itemMap;

    }

    function getAllIds(scaledItems) {

        var ids = Object.keys(scaledItems);
        return JSON.stringify(ids);
    }


    function throwAnErrorToUI(response, statusCode, internalErrorCode) {
        var exception = { "userMessage": "could use this to check for key but will use internalErrorCode (when present) instead",
            "httpStatusCode": statusCode,
            "internalErrorCode": internalErrorCode,  // If not in dictionary - will present generic message UX people want
            "developerMessage": "Some info for developer",
            "time": " ",
            "links": [],
            "errorData": "[userName1, userName2]"
        };
        response.status(statusCode).send(JSON.stringify(exception));
    }
};