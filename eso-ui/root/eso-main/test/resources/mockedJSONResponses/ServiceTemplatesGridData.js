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
 * Date: 05/01/18
 */
if (typeof define !== 'function') {
    var define = require('../../../../node_modules/amdefine')(module);
}


define(function () {

    /**
     * simulated response from /eso-service/v1/service-models
     * (will scale this up to test pagination)
     */


    return [
        {
            "description": null,
            "id": "081a7fea-d142-4b26-9f6c-3da2cd29e82d",
            "name": "massive-mtc",
            "service_template_file_name": "massive.yaml",
            "upload_time": "2017-12-19 13:55 GMT"
        }


    ]

});
