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
 * Date: 26/11/17
 */
define({

        /**
         * This class is to hold reference to ALL  REST calls uses by this UI
         *
         */

        network_slices: {

            /**
             * GET : List Slices
             * POST: Create slice (body {serviceModelId: id,  inputs {})
             * DELETE :  with slice id ("/sliceId" )
             * PUT : TODO Ref Constants.SHOW_START_WORKFLOW (UI Code is there - but there is no PUT to Date - e.g. no start work flow use case as create will start install workflow in backend)
             */
            NETWORK_SLICES: "/eso-service/v1/service-instances" ,


            /**
             * GET: Get Execution plan data for network slice, passing network slice Id in place of {0}  TODO fake server only
             */
            EXECUTION_PLAN : "/eso-service/v1/service-instances/{0}/executionPlan"

        },


        serviceTemplates: {

            /**
             * Service Templates ESO service used both to
             *
             * 1) Display paginated grid of services templates:
             *
             *      e.g. GET eso-service/v1/service-models?offset=0&limit=50sortAttr=name&sortDir=asc&filters={{name: 'Hell"}}
             *
             *      To suit client SDK paginated layout, would want our server to send response, like
             *          {
             *              total: 9000    (note a number : same as total id count - unless filter the data)
             *              items: [{rowData, rowData}]
             *          }
             *      where row Data must contain an "id" attribute in each row, e.g.
             *
             *         {
             *          "description": null,
             *          "id": "081a7fea-d142-4b26-9f6c-3da2cd29e82d",
             *          "name": "massive-mtc",
             *          "service_template_file_name": "massive.yaml",
             *          "upload_time": "2017-12-19 13:55 GMT"
             *          }
             *
             *
             * 2) Used in eso service to display Service Template Names (used to populate the
             * SelectBox used to select service templates during instance (slice) creation).
             *
             * e.g. GET eso-service/v1/service-models       (no offsets, etc. supplied and UI will
             *
             *
             * GET :    As above
             * DELETE : Pass array of Ids in body of delete call, e.g. (["081a7fea-d142-4b26-9f6c-3da2cd29e82d-1","081a7fea-d142-4b26-9f6c-3da2cd29e82d-10"]:
             * POST :   Upload yaml file  (blueprint - service template) along with "name" and "description")
             *
             */
            SERVICES_TEMPLATES_GRID_DATA: "/eso-service/v1/service-models",

            /**
             * GET : List of all IDs to support service template table (blueprints, models) as a paginated table
             *
             * To suit client SDK paginated layout, would want our
             * server to sent array response, like
             * ["id1, "id2", "id3", ....]
             */
            SERVICE_TEMPLATES_ALL_IDS: "/eso-service/v1/service-model-ids",

            /**
             * GET : List all inputs associated with a selected service template
             *       {0} will be replaced with service template ID  (not name), e.g. 6fc480b5-1de5-4fec-8a75-820dacd4d57e
             */
            INPUTS_FOR_SERVICE_TEMPLATE: "/eso-service/v1/service-models/{0}/inputs",


            /**
             * TODO Note : Ref Constants.SHOW_START_WORKFLOW
             * Start workflow NOT Existing on Server to date
             *
             * GET : List all work-flows (with their inputs (parameters) associated with a selected service template
             *        {0} will be replaced with service template Name (not Id)
             */
            WORKFLOWS_FOR_SERVICE_TEMPLATE: "/eso-service/v1/service-models/{0}/workflows"

        }

    }
);