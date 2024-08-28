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
 * Date: 06/12/17
 */
define([
    './Dictionary',
    'eso-commonlib/Constants'],
    function (Dictionary, Constants) {
        'use strict';

        /**
         * Class responsible for buttons that appear in the
         * Navigation Bar when viewing the Create Network Slice Application
         */

        return {


            getDefaultActions: function (saveAnExecuteAction, cancelAction) {

                this.saveAnExecuteAction = saveAnExecuteAction;
                this.cancelAction = cancelAction;

                var saveCaption = (Constants.SHOW_START_WORKFLOW) ? Dictionary.captions.SAVE : Dictionary.captions.SAVE_AND_EXECUTE;

                return [
                    {
                        name: saveCaption,
                        type: "button",
                        color: 'blue',
                        action: saveAnExecuteAction
                    },
                    {
                        name: Dictionary.captions.CANCEL,
                        type: "button",
                        action: cancelAction
                    },
                    {
                        name: Dictionary.links.SERVICE_TEMPLATE_APP_LINK_NAME,
                        type: "link",
                        link: Constants.lcHash.SERVICE_TEMPLATE_APP

                    }
                ];

            },


            getActionsWhenWorkFlowSelected: function () {

                return [
                    {
                        name: Dictionary.captions.SAVE_AND_EXECUTE,   // Change name of button (and context menu)
                        type: "button",
                        color: 'blue',
                        action: this.saveAnExecuteAction
                    },
                    {
                        name: Dictionary.captions.CANCEL,
                        type: "button",
                        action: this.cancelAction
                    },
                    {
                        name: Dictionary.links.SERVICE_TEMPLATE_APP_LINK_NAME,
                        type: "link",
                        link: Constants.lcHash.SERVICE_TEMPLATE_APP

                    }
                ];
            }


        };
    });

