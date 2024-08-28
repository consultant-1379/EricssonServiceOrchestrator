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
 * Date: 04/01/18
 */

define([
    './../../Dictionary'
],
    function (Dictionary) {
        'use strict';

        /**
         * Class responsible for buttons that appear in the
         * Navigation Bar when viewing the service Templates Application
         *
         * Note: The Default (Install) option when nothing is selected is in
         * this.getServiceTemplatesRegion().getDefaultActions()
         */

        return {


            getActionsWhenOneRowSelected: function (deleteAction, createSliceAction) {

                return [
                    {
                        name: Dictionary.captions.DELETE_SERVICE_TEMPLATE,
                        type: "button",
                        icon: "delete",
                        action: deleteAction
                    },
                    {
                        name: Dictionary.captions.CREATE_SLICE,
                        type: "button",
                        action: createSliceAction
                    }
                ];

            },


            getActionsWhenMultipleRowsSelected: function (deleteAction) {

                return [
                    {
                        name: Dictionary.captions.DELETE_SERVICE_TEMPLATE,
                        type: "button",
                        icon: "delete",
                        action: deleteAction
                    }
                ];

            }


        };
    });