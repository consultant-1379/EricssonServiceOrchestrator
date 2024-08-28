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
 * Date: 27/11/17
 */
define([
    './Dictionary',
    'jscore/core',
    'eso-commonlib/Constants'],
    function (Dictionary, core, Constants) {
        'use strict';

        /**
         * Class responsible for buttons that appear in the
         * Navigation Bar when viewing the main application
         */

        return {


            getDefaultActions: function () {

                var defaultActions = [

                    {
                        name: Dictionary.captions.CREATE_SLICE,
                        type: "button",
                        color: 'blue',
                        // SDK do not offer a title (tooltip) option when construct this way (as apposed to defining all in a widget)
                        action: function () {
                            window.location.hash = Constants.lcHash.CREATE_SLICE_APP;
                        }
                    },
                    {
                        type: "separator"
                    }
                ];

                return defaultActions.concat(getPrimaryNavLinks());

            },


            /**
             * Return context menu items on Tree Selection
             * @param deleteAction              : network slice delete action
             * @param startWorkFlowAction       : network slice start workflow action
             * @returns {*}
             */
            getRightClickMenuActionsIfSliceSelected: function (deleteAction, startWorkFlowAction) {

                return getContextActionsForNetworkSlice(deleteAction, startWorkFlowAction, true);
            },

            /**
             * Top Section context menu options (also include the primary links)
             * @param deleteAction     : network slice delete action
             * @param startWorkFlowAction       : network slice start workflow action

             * @returns {Array}
             */
            getTopSectionContextActionsIfSliceSelected: function (deleteAction, startWorkFlowAction) {

                var topSectionContextItems = getContextActionsForNetworkSlice(deleteAction, startWorkFlowAction);

                topSectionContextItems.push(
                    {
                        type: "separator"
                    }
                );

                return topSectionContextItems.concat(getPrimaryNavLinks());
            }

        };

        function getPrimaryNavLinks() {
            return [

                {
                    name: Dictionary.links.SERVICE_TEMPLATE_APP_LINK_NAME,
                    type: "link",
                    link: Constants.lcHash.SERVICE_TEMPLATE_APP

                },
                {
                    name: Dictionary.links.PLUGINS_APP_LINK_NAME,
                    type: "link",
                    link: Constants.lcHash.PLUGINS_APP

                }
            ];

        }

        function getContextActionsForNetworkSlice(deleteAction, startWorkFlowAction, isFromRightClick) {
            var contextActions;

            var primaryDeleteIcon = (isFromRightClick) ?   "delete" : "delete_white";

            if (Constants.SHOW_START_WORKFLOW) {
                contextActions = [

                    {
                        name: Dictionary.captions.START_WORK_FLOW,
                        type: "button",
                        color: 'blue',
                        action: startWorkFlowAction
                    },
                    {
                        name: Dictionary.captions.DELETE_SLICE,
                        type: "button",
                        icon: "delete",
                        // SDK do not offer a title (tooltip) option when construct this way (as apposed to defining all in a widget)
                        action: deleteAction
                    }

                ];
            } else {

                contextActions = [

                    {
                        name: Dictionary.captions.DELETE_SLICE,
                        type: "button",
                        icon: primaryDeleteIcon,   // white if on a blue button
                        color: 'blue',
                        action: deleteAction
                    }

                ];

            }
            return contextActions;


        }

    });



