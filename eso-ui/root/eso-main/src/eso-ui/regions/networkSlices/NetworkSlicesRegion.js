define([
    'jscore/core',
    'uit!./NetworkSlicesRegion.html',
    '../../Dictionary',

    './GetNetSliceListResponseParser',

    'widgets/Loader',
    'widgets/InlineMessage',

    '../../widgets/networkSlices/neSliceDisplayWidget/NeSliceDisplayWidget',
    '../../widgets/networkSlices/neSliceListItem/NeSliceListItem',

    'eso-commonlib/AjaxService',
    'eso-commonlib/Constants',
    'eso-commonlib/DialogUtils',
    'eso-commonlib/UrlConstants',
    'eso-commonlib/Utils'

], function (core, View, Dictionary, GetNetSliceListResponseParser, Loader, InlineMessage, NeSliceDisplayWidget, NetworkSliceListItem, ajaxService, Constants, DialogUtils, UrlConstants, Utils) {
    'use strict';

    /**
     * Region showing list of Network Slices
     */

    return core.Region.extend({

        view: function () {
            return new View({CLEAR_SELECTION: Dictionary.CLEAR_SELECTION,
                CLEAR_SELECTION_TOOLTIP: Dictionary.CLEAR_SELECTION_TOOLTIP});
        },


        onStart: function () {

            this.fetchNetworkSlicesListFromServer(false);
            this.startPolling();

        },

        onStop: function () {

            this.handleHouseKeepingOnClose();
        },

        startPolling: function () {
            this.pollingInstance = core.Window.setInterval(this.fetchNetworkSlicesListFromServer.bind(this, true), Constants.polling.NETWORK_SLICE_LIST_POLLING_INTERVAL_MS);
        },

        stopPolling: function () {
            if (this.pollingInstance) {
                this.pollingInstance.stop();
                delete this.pollingInstance;
            }

        },

        handleHouseKeepingOnClose: function () {
            this.stopPolling();   // already should be done in App lifecycle  TODO need ?

        },

        /**
         * Make Server call to Fetch Network Slices
         * @param isPolling     true if making the call though a poll (or updating existing data and  do not want to show loading slices message)
         * @param sliceName     May be applicable for say if just created a new Slice (duplicate names not allowed),
         *                      and wish to now select it when return from the fetch call (with the new slice)
         */
        fetchNetworkSlicesListFromServer: function (isPolling, sliceName) {

            this.showLoadingAnimation(!isPolling, Dictionary.loadingMessages.LOADING_NETWORK_SLICES);

            ajaxService.getCall({
                url: UrlConstants.network_slices.NETWORK_SLICES,
                success: this.onFetchNetworkSlicesListSuccess.bind(this, sliceName),
                error: this.onFetchNetworkSlicesListError.bind(this)
            });

        },

        onFetchNetworkSlicesListSuccess: function (sliceName, responseData) {

            var parsedData = GetNetSliceListResponseParser.parseNetworkSliceInfoForDisplay(responseData);

            this.showLoadingAnimation(false);

            this.updateNeSlicesDisplay(parsedData, sliceName);


        },

        onFetchNetworkSlicesListError: function (model, response) {

            this.showLoadingAnimation(false);

            if (DialogUtils.isSecurityDeniedResponse(response)) {  // unrecoverable (will have to re-login again)

                this.stopPolling();
                DialogUtils.showForbiddenDialog(Dictionary.forbiddenActionMessages.READ_NETWORK_SLICES);
                this.showInlineMessage(DialogUtils.createForbiddenInlineMessage(Dictionary.forbiddenActionMessages.READ_NETWORK_SLICES));

            } else {

                this.showInlineMessage(DialogUtils.createErrorInlineMessage(response));
            }

            this.getEventBus().publish(Constants.events.NETWORK_SLICE_LIST_UPDATED, false);
        },

        updateNeSlicesDisplay: function (parsedData, sliceName) {

            this.removeAndHideChildElements();

            var isEmpty = (typeof parsedData === 'undefined' || parsedData.length === 0);

            if (isEmpty) {

                this.showEmptyDataMessage();

            } else {

                this.createUpdateNeSlicesDisplayWidget(parsedData, sliceName);
            }

            var selectedItemData = Utils.isDefined(this.neSlicesDisplayWidget) ? this.neSlicesDisplayWidget.getSelectedItemData() : undefined;
            this.getEventBus().publish(Constants.events.NETWORK_SLICE_LIST_UPDATED, !isEmpty, selectedItemData);

        },


        showEmptyDataMessage: function () {

            var infoInlineMessage = new InlineMessage({
                header: Dictionary.inline.NO_NETWORK_SLICES_FOUND_HEADER,
                description: Dictionary.inline.NO_NETWORK_SLICES_FOUND
            });

            this.showInlineMessage(infoInlineMessage);

        },

        createUpdateNeSlicesDisplayWidget: function (parsedData, sliceName) {

            if (typeof this.neSlicesDisplayWidget === 'undefined') {

                this.neSlicesDisplayWidget = new NeSliceDisplayWidget({
                    eventBus: this.getEventBus(),
                    data: parsedData,
                    upDateNetworkSlicesTitle: this.options.upDateNetworkSlicesTitle,
                    getFilterHolder: this.getFilterHolder.bind(this),
                    getClearSelectionDiv: this.getClearSelectionOptionHolder.bind(this),
                    showLoadingAnimation: this.showLoadingAnimation.bind(this)
                });
                this.neSlicesDisplayWidget.attachTo(this.getContentHolder());

            } else {

                this.neSlicesDisplayWidget.upDate(parsedData);
            }

            if (Utils.isDefined(sliceName)) {
                // TODO scroll rect to visible !
                /* select the Network Slice you have just created so that the Topology Graph for same can be shown */
                this.neSlicesDisplayWidget.selectNetworkSliceByName(sliceName, false);
            }

        },


        /**
         * Attach InlineMessage object
         * after removing all other elements on DOM and top section context buttons
         * @param inlineMessage  constructed InlineMessage
         */
        showInlineMessage: function (inlineMessage) {

            this.removeAndHideChildElements();
            this.removeNeSlicesDisplay();
            this.getEventBus().publish("topsection:leavecontext");
            inlineMessage.attachTo(this.getInlineMessageHolder());
        },


        /**
         * Removing all children (as to show inline message would not
         * want to be showing filter and clear selection, etc)
         */
        removeAndHideChildElements: function () {

            Utils.removeAllChildrenFromElement(this.getInlineMessageHolder());
            Utils.removeAllChildrenFromElement(this.getFilterHolder());   // will have to put this back on upDate

            this.getClearSelectionOptionHolder().setStyle("visibility", 'hidden');

        },

        removeNeSlicesDisplay: function () {
            if (this.neSlicesDisplayWidget) {
                this.options.upDateNetworkSlicesTitle(); // for undefined (no) row count

                this.neSlicesDisplayWidget.detach();
                this.neSlicesDisplayWidget.destroy();
                delete this.neSlicesDisplayWidget;
            }
        },


        /* Loading life cycle */

        /**
         * This loading animation shall block out the region
         * (Network Slices Area only)
         *
         * @param isShow - if true the loader is displayed, otherwise it is destroyed
         */
        showLoadingAnimation: function (isShow, loadingMessage) {
            if (isShow) {
                this.createLoadingAnimation(loadingMessage);
            } else {
                this.destroyLoadingAnimation();
            }
        },

        createLoadingAnimation: function (loadingMessage) {
            if (typeof this.loader === 'undefined') {
                this.loader = new Loader({
                        loadingText: loadingMessage } //Dictionary.loadingMessages.LOADING_NETWORK_SLICES}
                );
                this.loader.attachTo(this.getContentHolder());
            }

        },

        destroyLoadingAnimation: function () {
            if (typeof this.loader !== 'undefined') {
                this.loader.destroy();
                delete this.loader;
            }
        },

        /* DOM interaction */

        getContentHolder: function () {
            return this.findElementByClassName("-content");
        },

        getInlineMessageHolder: function () {
            return this.findElementByClassName("-inlineMessageHolder");
        },

        /**
         * (keeping filter holder as part of region so has static positioning)
         * @returns {*}
         */
        getFilterHolder: function () {
            return this.findElementByClassName("-filter");
        },

        getClearSelectionOptionHolder: function () {
            return this.findElementByClassName("-selectionClear");
        },


        /**
         * Adding prefix present on all divs in the widget's html
         * @param suffix   - end of the name
         * @returns {*}
         */
        findElementByClassName: function (suffix) {
            return this.getElement().find(".eaEsoUi-rNetworkSlicesRegion" + suffix);
        }
    });
});
