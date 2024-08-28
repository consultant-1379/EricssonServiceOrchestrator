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
define([

], function () {

    /**
     * Class containing some standard utils methods used through-out code
     */
    return {

        ISDEBUGGING: true,  // can turn this off on a final production run

        /**
         * Log method preferred to enable turning of log for production mode
         * (In most all cases the Browser Developer Tools will tell us
         * all we need to know)
         *
         * @param msg        message being displayed
         * @param response   error response
         */
        log: function (clientPartOfMessage, errorResponse) {
            if (this.ISDEBUGGING) {
                var serverPart = '';
                if (typeof errorResponse !== 'undefined' && typeof errorResponse.getResponseText === 'function') {
                    serverPart = ", Reason: " + errorResponse.getResponseText();
                }
                console.log(clientPartOfMessage + serverPart);
            }

        },

        /**
         * Creates a new object using the properties of the passed objects.
         * (used for Dictionary)
         *
         * @method mergeObjects
         * @param {Object} obj1
         * @param {Object} obj2
         * @return {Object} mergedObject
         */
        mergeObjects: function (obj1, obj2) {
            var output = {};
            var prop;
            for (prop in obj1) {
                output[prop] = obj1[prop];
            }

            for (prop in obj2) {
                output[prop] = obj2[prop];
            }

            return output;
        },

        isDefined: function (obj) {
            return typeof obj !== 'undefined';
        },


        /**
         * Remove all elements from DOM element
         * @param divElement    (containing #getNative method)
         */
        removeAllChildrenFromElement: function (divElement) {
            /* remove any existing items */
            if (typeof divElement.getNative === 'function') {
                var domNode = divElement.getNative();
                while (domNode.hasChildNodes()) {
                    domNode.removeChild(domNode.lastChild);
                }

            } else {
                this.log("Utils #removeAllChildrenFromElement failed");
            }
            return divElement;

        },

        /**
         * Convert to a format that can be used to populate a select box
         *
         * @param arrayOfItems  Array of Name Strings
         * @returns {Array}         // TODO PHASING OUT
         */
        convertToSelectBoxItems: function (arrayOfItems) {
            var items = [];
            for (var i = 0; i < arrayOfItems.length; i++) {
                var item = arrayOfItems[i];
                items.push({
                    name: item,
                    value: item,   // for as long as using name as id
                    title: item
                });
            }
            return items;
        },

        /**
         * Convert to a format that can be used to populate a select box
         * @param arrayOfItems   Sample items response from a grid data call,
         *                       e.g [   {
         *                       "description": null
         *                       "id": "081a7fea-d142-4b26-9f6c-3da2cd29e82d",
         *                       "name": "massive-mtc",
         *                       "service_template_file_name": "massive.yaml",
         *                       "upload_time": "2017-12-19 13:55 GMT
         *                       }, {}, {}]
         ]
         * @returns {Array}
         */
        convertToSelectBoxItemsWhenHaveNamesWithIds: function (arrayOfItems) {
            var items = [];
            for (var i = 0; i < arrayOfItems.length; i++) {
                var item = arrayOfItems[i];
                items.push({
                    name: item.name,
                    value: item.id,
                    title: item.description
                });
            }
            return items;
        },

        removeNewLines: function (data) {
            var str = JSON.stringify(data);
            var quotesReplace = new RegExp('\\\\n', 'g');
            str = str.replace(quotesReplace, '');
            data = JSON.parse(str);
            return data;
        },

        deleteKeysInJavaScriptObjectExceptKeys: function (jsObject, keysToKeep) {

            var keepArray = (typeof keysToKeep !== 'undefined' ? keysToKeep : []);

            for (var key in jsObject) {
                if (jsObject.hasOwnProperty(key)) {
                    if (keepArray.indexOf(key) === -1) {   // not found delete wanted
                        delete jsObject[key];
                    }
                }
            }
        },

        deleteKeysInJavaScriptObject: function (jsObject, keysToDelete) {

            var deleteArray = (typeof keysToDelete !== 'undefined' ? keysToDelete : []);

            for (var key in jsObject) {
                if (jsObject.hasOwnProperty(key)) {
                    if (deleteArray.indexOf(key) !== -1) {   // found delete wanted
                        delete jsObject[key];
                    }
                }
            }
        },


        /**
         * Utility showing or hiding (as apposed to detaching) an element
         * Display used is "inline-block"
         *
         * @param widget    element
         * @param isShow    true to show, false to hide element from display
         */
        showElementInlineBlock: function (element, isShow) {
            if (typeof element !== 'undefined') {
                element.setStyle("display", (isShow) ? "inline-block" : "none");
            }
        },

        /**
         * Utility showing or hiding (as apposed to detaching) an element
         * Display used is "inline"
         *
         * @param widget    element
         * @param isShow    true to show, false to hide element from display
         */
        showElementInline: function (element, isShow) {
            if (typeof element !== 'undefined') {
                element.setStyle("display", (isShow) ? "inline" : "none");
            }
        },

        /**
         * Look for parameter from hash or URL,
         * e.g. "?offset=0&limit=50&sortAttr=name&sortDir=asc&filters={}
         * or say  window.location.hash
         *
         * @param queryParameters  e.g. window.location.hash,
         * @param paramKey         e.g. "filters"
         *
         * @returns {*}  parameter value or undefined if not found
         */
        getItemValueFromQueryParams: function (queryParameters, paramKey) {
            var params = getQueryParams(queryParameters);
            return params[paramKey];  // can be undefined

        }

    };

    function getQueryParams(query) {
        var params = {};
        (query.split('?')[1] || '').split('&').filter(function (val) {
            return val !== '';
        }).forEach(function (val) {
                var match = /^(.*)=(.*)$/g.exec(val) || [null, val, true];
                params[match[1]] = match[2];
            });
        return params;
    }
});
