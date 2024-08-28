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
 * Date: 16/02/18
 */

define([
    'jscore/core',
    '../../Dictionary',

    'widgets/Accordion',
    'widgets/Tree',

    'eso-commonlib/JsonDisplayer',
    'eso-commonlib/Utils'


], function (core, Dictionary, Accordion, Tree, JsonDisplayer, Utils) {
    'use strict';

    /**
     * Widget showing Execution Plan for a Selected Network Slice
     * in a "vertical" way (tree of tables)
     * with more details than in the horizontal steps had.
     *
     * The details is some random JSON added to the step information
     *
     * This widget can be used as content to flyout
     *
     */
    return core.Widget.extend({


            /**
             * Initialise with server data for steps
             *
             * Server will add extra data : but require these ones (id, title, complete) to be able to use
             * the client SDK widget directly.
             *
             * Do not know what this data might be. For horizontal timeline will require some
             * (current, steps.id, steps.title, steps.complete) but this can take any as yet unknown JSON
             * included with that response, e.g.
             *
             *   {
             *      current: 'step1',
             *      steps: [
             *      {..},
             *      {..},
             *      {
             *       "id": "step5",           // example (only) of extra information
             *       "name": "configure",
             *       "type": "Node",
             *       "title": "configure: fm-node-1",
             *       "node": "fm-node-1",
             *       "implementation": "scripts/configure_fm_node.py",
             *       "inputs": [{
             *          "name": "fm-node-ip",
             *          "value": "10.0.0.1",    (value could be array of JSON too)
             *          "type": "string"
             *        }],
             *        "complete": false
             *        }
             *      ]
             *  }
             */
            init: function (options) {

                this.options = (options) ? options : {};
                this.steps = this.options.steps;
                this.isAllStepsCompletePreviously = this.options.isAllStepsCompletePreviously;

            },

            onViewReady: function () {

                this.createExecutionDetailsTree(undefined);

            },

            /**
             * Only required if we consider that this extra content
             * in the step could be changing dynamically while flyout is open
             *
             * Re-draw tree of steps and expand what was previously expanded
             *
             * @param steps
             */
            updateSteps: function (steps) {

                if (!this.isAllStepsCompletePreviously(this.steps)) {  // existing data (not the new data)  will not be changing any more so stop refreshing

                    this.steps = steps;

                    var currentExpandedIds = this.getStepIdsOfExpandedItems();

                    this.createExecutionDetailsTree(currentExpandedIds);
                }
            },

            /**
             * Create (or recreate) tree of JSON data
             * @param currentExpandedIds   if restoring an existing tree, following a server
             *                             update to data, then restore previously expanded items
             */
            createExecutionDetailsTree: function (currentExpandedIds) {

                this.destroyExecutionDetailsTree();

                this.detailsTree = this.createJSONDataTree();

                if (Utils.isDefined(currentExpandedIds)) {

                    this.expandTreesItems(currentExpandedIds);
                }

                this.detailsTree.attachTo(this.getElement());
            },

            destroyExecutionDetailsTree: function () {
                if (this.detailsTree) {
                    this.detailsTree.detach();
                    this.detailsTree.destroy();
                    delete this.detailsTree;

                }
            },

            /**
             * Called when widget is content of flyout and flyout is opened
             */
            onShow: function () {

            },

            /**
             * Handling (re)expanding tree items followng an update
             * (imagining a server update comes in whilst the flyout is open)
             *
             * @param itemsToExpandArray   ids of items to expand
             */

            expandTreesItems: function (itemsToExpandArray) {

                this.collapseAll();   // not really needed as should be already collapsed when called
                var allTreeItems = this.detailsTree.getItems();

                allTreeItems.forEach(function (treeItem) {
                    var item = treeItem.options.item;
                    if (itemsToExpandArray.indexOf(item.id) !== -1) {
                        var accordion = item.labelContent;
                        accordion.trigger("expand");
                    }
                });
            },


            /**
             * The plan is that when click on an item in the Exection Plan horizontal view
             * that it will open the fliyout with the selected step opened up (and ideally selected)
             * @param selectedStepId
             */
            expandOneTreeItemOnly: function (selectedStepId) {

                this.collapseAll();

                if (selectedStepId) {
                    var treeItem = this.detailsTree.find({"id": selectedStepId});
                    if (treeItem) {
                        var accordion = treeItem.options.item.labelContent;
                        accordion.trigger("expand");
                        // ideally would like to trigger an "itemselect" too here

                    }
                }
            },


            collapseAll: function () {
                this.detailsTree.deselect();
                var allTreeItems = this.detailsTree.getItems();

                allTreeItems.forEach(function (treeItem) {
                    var accordion = treeItem.options.item.labelContent;
                    accordion.trigger("collapse");

                });

            },

            getStepIdsOfExpandedItems: function () {
                var allTreeItems = this.detailsTree.getItems();
                var expandedStepIds = [];
                allTreeItems.forEach(function (treeItem) {
                    var item = treeItem.options.item;
                    var accordion = item.labelContent;
                    if (accordion.isExpanded()) {
                        expandedStepIds.push(item.id);
                    }
                });

                return expandedStepIds;
            },


            createJSONDataTree: function () {

                var treeItemData = [];

                this.steps.forEach(

                    function (step) {

                        var stepId = step.id;

                        var content = this.getDisplayContent(this.steps, stepId);

                        treeItemData.push({
                            id: stepId,
                            labelContent: new Accordion({
                                title: step.title,
                                content: content
                            }),
                            label: step.title


                        });

                    }.bind(this)
                );

                return new Tree({
                    items: treeItemData
                });


            },

            getDisplayContent: function (stepData, stepId) {

                var stepInfo = stepData.filter(function (step) {
                    if (step.id === stepId) {
                        return step;
                    }
                });

                if (stepInfo instanceof Array) {

                    // filter method above returns an array.
                    // Remove items that are needed to present AdvancedWizardTimeline in horizontal view

                    Utils.deleteKeysInJavaScriptObject(stepInfo[0], ['id', 'clickMode' /*, 'complete'*/]);


                    return new JsonDisplayer({data: stepInfo[0]});
                }
            }

        }
    );
});
