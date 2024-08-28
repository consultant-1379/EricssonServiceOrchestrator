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
 * Date: 29/11/17
 */

define([
    'jscore/core',
    'container/api',
    'uit!./NeSliceDisplayWidget.html',
    './NeSliceContextActions',
    '../../../Dictionary',
    'widgets/Tree',
    '../neSliceListItem/NeSliceListItem',
    '../../../MainAppNavButtonHelper',

    'eso-commonlib/Constants',
    'eso-commonlib/FilterTextField',
    'eso-commonlib/Utils'

], function (core, containerApi, View, NeSliceContextActions, Dictionary, Tree, NeSliceListItem, MainAppNavButtonHelper, Constants, FilterTextField, Utils) {
    'use strict';

    /**
     * Widget displaying Network Slices (deployments)
     * fetched from server. Displayed with a filter component
     */

    return core.Widget.extend({

        /**
         *
         * @param options
         */
        init: function (options) {
            this.options = options ? options : {};

            this.data = this.options.data;
            this.upDateNetworkSlicesTitle = this.options.upDateNetworkSlicesTitle;
            this.getFilterHolder = this.options.getFilterHolder;

            this.eventBus = this.options.eventBus;

            this.clearSelectionDiv = this.options.getClearSelectionDiv();

            this.contextActionsHelper = new NeSliceContextActions({
                showLoadingAnimation: this.options.showLoadingAnimation
            });

        },

        view: function () {
            return new View(Dictionary);
        },


        onViewReady: function () {

            this.upDate(this.options.data);

            this.attachTextFieldFilterWidget();

        },


        onDestroy: function () {
            this.tearDownTree();

        },

        /**
         * Update Tree with new Data
         *
         * @param data  array of
         *
         *     [{ networkSliceId     : unique id of network slice
         *      networkSliceName   : singleItem.name,
         *      executionState: getExecutionState(lastExecutedWorkFlowServerData),
         *      progressStatus: getProgressStatus (lastExecutedWorkFlowServerData),
         *      serviceTemplateName: responseData[i].serviceModelName,
         *      errorDetails: getErrorDetails(lastExecutedWorkFlowServerData),
         *      initializationTime: responseData[i].initializationTime,
         *      workFlowName: getLastExecutedWorkFlowName(lastExecutedWorkFlowServerData)
         *     }, {}]
         *
         */
        upDate: function (data) {

            this.attachTextFieldFilterWidget(); // in case lost when showed an inline message (server failure)
            var treeItemData = [];
            this.currentData = data;

            data.forEach(

                function (item) {

                    if (this.isIncludedByCurrentFilter(item)) {

                        var labelWidget = new NeSliceListItem (item);

                        treeItemData.push({                 // see widgets/Tree API
                            id: item.networkSliceId,
                            labelContent: labelWidget,
                            label: item.networkSliceName   // (adding so can find by name too) - server must make sure not a duplicate

                        });

                    }
                }.bind(this)
            );

            this.updateTreeItemData(treeItemData);

        },

        /**
         * Creates or replace tree with item select listener
         * Reselect an original selection (without invoking selection listener)
         * - e.g following tree update - or update via filter
         *
         * @param treeItemData
         */
        updateTreeItemData: function (treeItemData) {

            var selectedItem, replacedNeSlicesTree;

            // trying quick detach and attach of new tree (so constructing it first)
            replacedNeSlicesTree = new Tree({
                items: treeItemData
            });


            if (typeof this.neSlicesTree !== 'undefined') {

                selectedItem = this.neSlicesTree.getSelectedItem();
                this.tearDownTree();
            }

            this.updateSlicesInfoCountForTitle(treeItemData.length);
            replacedNeSlicesTree.attachTo(this.getNeSliceDisplayHolder());

            this.neSlicesTree = replacedNeSlicesTree;


            if (selectedItem) {

                /**
                 * note : Not added listener at this point for click off functionality to work.
                 * If filter means no longer showing selected item - then clear context menu
                 */
                this.selectNetworkSliceById(selectedItem.options.item.id, true);

            }

            this.addEventHandlers();

        },

        /**
         * Select Item in Tree having the NetworkSlice Id
         * @param id                id of slice
         * @param clearIfNotFound   If do not find item, true if want to clear current selection
         */
        selectNetworkSliceById: function (id, clearIfNotFound) {
            var foundItem = this.neSlicesTree.find({id: id});

            this.selectFoundItem(foundItem, clearIfNotFound);

        },

        /**
         * Select Item in Tree having the NetworkSlice Id
         * @param id                id of slice
         * @param clearIfNotFound   If do not find item, true if want to clear current selection
         */
        selectNetworkSliceByName: function (name, clearIfNotFound) {
            var foundItem = this.neSlicesTree.find({label: name});   // widgets/Tree API

            this.selectFoundItem(foundItem, clearIfNotFound);
        },

        selectFoundItem: function (foundItem, clearIfNotFound) {

            if (foundItem) {
                foundItem.select();
                this.showClearSectionOption(true);
            } else {
                if (clearIfNotFound) {
                    this.clearSelectedItem();
                }
            }
        },


        addEventHandlers: function () {
            this.neSlicesTreeSelectEventId = this.neSlicesTree.addEventHandler('itemselect', this.treeItemSelectListener.bind(this));

            // client SDK does not seem to support contextmenu event on Tree directly?  (using #getElement)
            this.neSlicesTreeContextMenuEventId = this.neSlicesTree.getElement().addEventHandler('contextmenu', this.treeContextMenuListener.bind(this));

            this.clearSelectionEventId = this.clearSelectionDiv.addEventHandler('click', this.clearSectionOptionListener.bind(this));

        },

        removeEventHandlers: function () {
            if (this.neSlicesTree) {
                if (this.neSlicesTreeSelectEventId) {
                    this.neSlicesTree.removeEventHandler("itemselect", this.neSlicesTreeSelectEventId);
                }
                if (this.neSlicesTreeContextMenuEventId) {
                    // Note #getElement - did not use client SDK
                    this.neSlicesTree.getElement().removeEventHandler(this.neSlicesTreeContextMenuEventId);
                }
            }

            if (this.clearSelectionEventId && this.clearSelectionDiv) {
                this.clearSelectionDiv.removeEventHandler(this.clearSelectionEventId);
            }
        },

        /**
         * Un-select any selected item and clear any context menu items on top section
         */
        clearSelectedItem: function () {
            this.neSlicesTree.deselect();
            delete this.selectedTreeItem;
            this.hideContextActions();
            this.showClearSectionOption(false);
            this.eventBus.publish(Constants.events.NETWORK_SLICE_SELECTED_OR_DESELECTED);  // passing undefined means unselect
        },

        hideContextActions: function () {
            this.eventBus.publish("topsection:leavecontext");
            containerApi.getEventBus().publish("contextmenu:hide");
        },

        /**
         * Item select on tree
         * "Click on",  "Click off" selection
         *  i.e. click off if click on previous selection
         *
         * @param event
         */
        treeItemSelectListener: function (event) {

            var selectItem = this.neSlicesTree.getSelectedItem();

            if (selectItem !== this.selectedTreeItem) {

                this.selectedTreeItem = selectItem;
                this.showClearSectionOption(true);

                if (this.isItemUnSelectedOrExecuting()) {
                    this.hideContextActions();
                } else {

                    var contextActionsForTopSection = MainAppNavButtonHelper.getTopSectionContextActionsIfSliceSelected(this.deleteSliceContextAction.bind(this), this.startWorkFlowContextAction.bind(this));
                    this.eventBus.publish('topsection:contextactions', contextActionsForTopSection);
                }

            } else {
                // Clicking a Selected item clears selection
                this.clearSelectedItem();
            }

            // note publishing undefined when clear selection
            this.eventBus.publish(Constants.events.NETWORK_SLICE_SELECTED_OR_DESELECTED, this.getSelectedItemData());

        },

        /**
         * Show or hide clear selection link
         * (keeping clear selection holder as part of region so has static positioning)
         * @returns {*}
         */
        showClearSectionOption: function (isShow) {
            /* not using "display" for error icon functionality to still work on selected row when "click off selection */
            this.clearSelectionDiv.setStyle("visibility", (isShow) ? 'visible' : 'hidden');

        },

        clearSectionOptionListener: function (event) {
            this.clearSelectedItem();
        },

        deleteSliceContextAction: function () {
            return this.contextActionsHelper.deleteSliceContextMenuAction(this.getSelectedNetworkSliceName(), this.getSelectedNetworkSliceId());
        },

        startWorkFlowContextAction: function () {
            return this.contextActionsHelper.startWorkFlowContextAction(this.getSelectedNetworkSliceName(), this.getSelectedServiceTemplateId(), this.eventBus);
        },

        /**
         * Right click context menu listener on tree
         * @param event
         */
        treeContextMenuListener: function (event) {

            if (this.isItemUnSelectedOrExecuting()) {
                this.hideContextActions();
            } else {

                var rightClickMenuActions = MainAppNavButtonHelper.getRightClickMenuActionsIfSliceSelected(this.deleteSliceContextAction.bind(this), this.startWorkFlowContextAction.bind(this));
                containerApi.getEventBus().publish("contextmenu:show", event, rightClickMenuActions);  // right click menu
            }

        },

        /**
         * Should not allow user to "Start workflow" or "Delete slice" when
         * slice is still executing
         *
         * @returns {boolean}   true if there is a selected item and it is executing
         */
        isItemUnSelectedOrExecuting: function () {

            var haveSelection = typeof this.selectedTreeItem !== 'undefined';

            if (haveSelection) {

                try {

                    var execState = this.getSelectedItemLabelContent().executionState;
                    return execState === Constants.executionStates.IN_PROGRESS_EXECUTION_STATE;

                } catch (err) {
                    Utils.log("Failing to find data inside Tree item : " + err);
                    return false;
                }

            }
            return (!haveSelection);
        },


        /**
         * Return (which will be published on row selection)
         * @returns {*}  Data for item selected on the tree- or undefined if nothing selected in tree
         */
        getSelectedItemData: function () {

            return (Utils.isDefined(this.selectedTreeItem) ? this.getSelectedItemLabelContent() : undefined);

        },

        getSelectedItemLabelContent: function () {
            return this.selectedTreeItem.options.item.labelContent.options;
        },

        /**
         * Return name of selected Network Slice
         * @returns {*}  Slice name - or undefined if nothing selected in tree
         */
        getSelectedNetworkSliceName: function () {
            if (typeof this.selectedTreeItem !== 'undefined') {
                return this.getSelectedItemLabelContent().networkSliceName;
            }
        },

        /**
         * Return Unique Id of selected Network Slice
         * @returns {*}  Slice name - or undefined if nothing selected in tree
         */
        getSelectedNetworkSliceId: function () {
            if (typeof this.selectedTreeItem !== 'undefined') {
                return this.getSelectedItemLabelContent().networkSliceId;
            }
        },

        /**
         * Return the Service Template (blueprint or model) name
         * @returns {*} blueprint name used by the instance - or undefined if nothing selected in tree
         */
        getSelectedServiceTemplateId: function () {
            if (typeof this.selectedTreeItem !== 'undefined') {
                return this.getSelectedItemLabelContent().serviceTemplateName;
            }
        },


        tearDownTree: function () {
            if (typeof this.neSlicesTree !== 'undefined') {

                this.removeEventHandlers();

                this.neSlicesTree.detach();
                this.neSlicesTree.destroy();
                delete this.neSlicesTree;

            }
        },


        /**
         * Update Title of multi-sliding panel (see MainApplication) to include filter information if required
         * @param itemCount  number of items displayed in current tree
         */
        updateSlicesInfoCountForTitle: function (itemCount) {

            if (typeof itemCount !== 'undefined') {
                if (this.isDisplayFiltered()) {
                    this.upDateNetworkSlicesTitle("(" + itemCount + "  |  " + Dictionary.filterTextField.FILTER_APPLIED_HEADER + ")");

                } else {
                    this.upDateNetworkSlicesTitle("(" + itemCount + ")");
                }
            } else {
                this.upDateNetworkSlicesTitle();
            }


        },

        isDisplayFiltered: function () {
            return typeof this.currentFilterText !== 'undefined';
        },

        attachTextFieldFilterWidget: function () {


            if (!Utils.isDefined(this.filterTextField)) {

                this.filterTextField = new FilterTextField({
                    textFieldFilterHandler: this.textFieldFilterHandler.bind(this)
                });
            }

            if (!this.getFilterHolder().getNative().hasChildNodes()) {  // Region can remove filter

                this.filterTextField.attachTo(this.getFilterHolder());

            }

        },

        textFieldFilterHandler: function (filterText) {
            if (filterText === '') {
                delete this.currentFilterText;
            } else {
                this.currentFilterText = filterText;
            }
            this.upDate(this.currentData);

        },

        isIncludedByCurrentFilter: function (item) {

            if (!this.currentFilterText || this.currentFilterText === '') {
                return true;
            }
            var compareText = this.currentFilterText.toUpperCase();

            return  (item.networkSliceName.toUpperCase().indexOf(compareText) !== -1) || (item.serviceTemplateName.toUpperCase().indexOf(compareText) !== -1) || (item.initializationTime.toUpperCase().indexOf(compareText) !== -1) || (item.workFlowName.toUpperCase().indexOf(compareText) !== -1);
        },


        /* DOM interaction */


        getNeSliceDisplayHolder: function () {
            return this.findElementByClassName("-displayItems");
        },

        /**
         * Adding prefix present on all divs in the widget's html
         * @param suffix   - end of the name
         * @returns {*}
         */
        findElementByClassName: function (suffix) {
            return this.getElement().find(".eaEsoUi-wNeSliceDisplayWidget" + suffix);
        }

    });

})
;
