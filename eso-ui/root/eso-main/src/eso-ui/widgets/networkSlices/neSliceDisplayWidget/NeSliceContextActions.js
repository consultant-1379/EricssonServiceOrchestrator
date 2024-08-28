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
 * Date: 16/12/17
 */
define([
    'jscore/core',
    '../../../Dictionary',
    '../../startWorkflowDialog/StartWorkFlowDialog',

    'eso-commonlib/AjaxService',
    'eso-commonlib/Constants',
    'eso-commonlib/UrlConstants',
    'eso-commonlib/DialogUtils'
], function (core, Dictionary, StartWorkFlowDialog, ajaxService, Constants, UrlConstants, DialogUtils) {
    'use strict';

    /**
     * This class handling server calls,
     * associated with selecting a Network Slice (instance) from
     * tree display and calling a context function
     *
     * (e.g. delete slice, start workflow)
     */

    return core.AppContext.extend({

        /**
         * Init
         * @param options
         *      showLoadingAnimation : animation on Network Slices Region
         */
        init: function (options) {
            this.options = options ? options : {};
            this.showLoadingAnimation = this.options.showLoadingAnimation;
        },


        /**
         * Context Menu Action to call when request to Start Work Flow
         * @param networkSliceName      name of slice
         * @param serviceTemplateName   service template (blueprint) in slice  (Note this is actually a Name - would not have an id if using at create)
         * @param eventBus              context event bus
         */
        startWorkFlowContextAction: function (networkSliceName, serviceTemplateName, eventBus) {

            new StartWorkFlowDialog({networkSliceName: networkSliceName,
                serviceTemplateName: serviceTemplateName,
                eventBus: eventBus
            }).showStartWorkFlowDialog();
        },

        /**
         * Context Menu Action to call when request to delete Network Slice
         * @param networkSliceName  Name of selected Network Slice
         * @param networkSliceId    Unique Id of selected Network Slice
         */
        deleteSliceContextMenuAction: function (networkSliceName, networkSliceId) {
            if (networkSliceName) {
                var header = Dictionary.dialogMessages.HEADER_DELETE_NETWORK_SLICE;
                var message = Dictionary.dialogMessages.DELETE_NETWORK_SLICE_MESSAGE;
                message = message.replace("{0}", networkSliceName);

                DialogUtils.showWarningDialogWithActionAndCancel(header, message, "", Dictionary.captions.DELETE_NETWORK_SLICE, this.sendServerCallToDeleteSlice.bind(this, networkSliceName, networkSliceId));
            }
        },

        sendServerCallToDeleteSlice: function (networkSliceName, networkSliceId) {

            var loadingMessage = Dictionary.loadingMessages.LOADING_DELETING_SLICE;
            loadingMessage = loadingMessage.replace("{0}", networkSliceName);
            this.showLoadingAnimation(true, loadingMessage);

            // TODO a multiple delete call would be better
            ajaxService.deleteCall({
                url: UrlConstants.network_slices.NETWORK_SLICES + "/" + networkSliceId,
                success: this.onDeleteSliceSuccess.bind(this, networkSliceName),
                error: this.onDeleteSliceError.bind(this, networkSliceName)
            });
        },

        onDeleteSliceSuccess: function (networkSliceName, response) {

            this.showLoadingAnimation(false);
            var queryParam = Constants.hashQueryParams.NET_SLICE_NAME_EQUALS + networkSliceName;

            window.location.hash = Constants.lcHash.APP_HOME_PAGE_DELETE_SLICE_SUCCESS + '?' + queryParam;
        },

        onDeleteSliceError: function (networkSliceName, model, response) {

            this.showLoadingAnimation(false);
            if (DialogUtils.isSecurityDeniedResponse(response)) {  // unrecoverable (will have to re-login again)

                var forbiddenMessage = Dictionary.forbiddenActionMessages.DELETE_NETWORK_SLICE;
                forbiddenMessage = forbiddenMessage.replace("{0}", networkSliceName);

                DialogUtils.showForbiddenDialog(forbiddenMessage);

            } else {
                DialogUtils.showError(Dictionary.dialogMessages.HEADER_UNABLE_TO_DELETE_NETWORK_SLICE, response);
            }
        }
    });
});