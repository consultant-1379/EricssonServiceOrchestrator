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
 * Date: 24/11/17
 */

/**
 * Class to can be used to extract
 * server call functionality for common REST methods
 * (DELETE, PUT, POST, GET)
 *
 * Note using intercepted net
 */

define([
    'eso-commonlib/NetAjaxInterceptor',
    'eso-commonlib/HttpConstants'

], function (net, HttpConstants) {

    'use strict';


    // **************  DELETE  **************************/

    /**
     * AJAX DELETE call
     * @param options
     *          url :    URI end point
     *          success :   function to call on success
     *          error :     function to call on error
     *
     *
     * @returns {*}
     */
    function deleteCall(options) {

        // note  options.dataType = HttpConstants.mediaTypes.JSON here causing problems
        options.type = HttpConstants.methods.DELETE;

        return net.ajax(options);
    }


    // **************   GET **************************/


    /**
     * AJAX GET call
     * @param options
     *          url :    URI end point
     *          data:       key=value
     *          success :   function to call on success
     *          error :     function to call on error
     *
     *
     * @returns {*}
     */
    function getCall(options) {

        options.type = HttpConstants.methods.GET;
        options.dataType = HttpConstants.mediaTypes.JSON;

        return net.ajax(options);

    }


    // **************   POST **************************/

    /**
     * AJAX POST call
     * Note this method excepts caller to call JSON.stringify on data
     * @param options
     *          url :    URI end point
     *          data   : (expects caller to pass JSON.stringify if necessary)
     *          success :   function to call on success
     *          error :     function to call on error
     *
     *
     * @returns {*}
     */
    function postCall(options) {

        options.type = HttpConstants.methods.POST;
        options.contentType = HttpConstants.mediaTypes.CONTENT_TYPE_APPLICATION_JSON;
        options.dataType = HttpConstants.mediaTypes.JSON;
        options.processData = false;

        return  net.ajax(options);
    }


    // **************   PUT **************************/


    /**
     * AJAX PUT call
     * Note this method expects caller to call JSON.stringify on data
     * @param options
     *          url :    URI end point
     *          data   : (expects caller to pass JSON.stringify if necessary)
     *          success :   function to call on success
     *          error :     function to call on error
     *
     *
     * @returns {*}
     */
    function putCall(options) {

        options.type = HttpConstants.methods.PUT;
        options.contentType = HttpConstants.mediaTypes.CONTENT_TYPE_APPLICATION_JSON;
        options.dataType = HttpConstants.mediaTypes.JSON;
        options.processData = false;

        return net.ajax(options);
    }


    //////////////////   General  (all options for call have to be provided) ///////////////

    function generalAjax(options) {
        return  net.ajax(options);
    }


    return {

        ajax: generalAjax,
        deleteCall: deleteCall,
        getCall: getCall,
        postCall: postCall,
        putCall: putCall   //TODO not tested this
    };
});

