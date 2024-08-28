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
 * Date: 10/01/18
 */
define([
    'jscore/core',
    '../../Dictionary',
    '../../columns/ServiceTemplateColumnAttributes',

    'eso-commonlib/AjaxService',
    'eso-commonlib/Constants',
    'eso-commonlib/HttpConstants',
    'eso-commonlib/UrlConstants',
    'eso-commonlib/DialogUtils'

], function (core, Dictionary, ServiceTemplateColumnAttributes, ajaxService, Constants, HttpConstants, UrlConstants, DialogUtils) {
    'use strict';

    /**
     * This class handling actions for when
     * select top section options for Service Template App
     * when row or row selected (context actions)
     *
     * (e.g. Delete Service Template, Move to Create Slice App)
     *
     * Note: The Default (Install) option when nothing is selected is in
     * this.getServiceTemplatesRegion().getDefaultActions()
     */

    return core.AppContext.extend({


        /**
         * Init
         * @param options
         *      getSelectedRows : get current select rows
         *      getSelectedIds  : get current selected row ids
         *      handleRefresh   : calls to refresh table (can pass a toast message)
         *      elementToAttachLoader : getElement()
         */
        init: function (options) {

            this.options = options ? options : {};
            this.getSelectedRows = this.options.getSelectedRows;
            this.getSelectedIds = this.options.getSelectedIds;
            this.handleRefresh = this.options.handleRefresh;
            this.eventBus = this.options.eventBus;

        },


        /**
         * Method to create slice - available on single row selection.
         * Leaving application but no need to check if page is dirty ((unsaved changes),
         * for as long as there is nothing to change on the page
         */
        createNetworkSlice: function () {

            var selectedId = this.getSelectedIds()[0];

            window.location.hash = Constants.lcHash.CREATE_SLICE_APP + "?" + Constants.hashQueryParams.SERVICE_TEMPLATE_ID_EQUALS + selectedId;
        },


        /**
         * Method available on single and multiple row selection
         */
        showDeleteTemplatesWarning: function () {
            var selectedRows = this.getSelectedRows();

            var warningMessage, warningHeader;

            var dictionaryParameter;

            if (selectedRows.length === 1) {
                warningHeader = Dictionary.dialogMessages.HEADER_DELETE_SERVICE_TEMPLATE_SINGULAR;
                warningMessage = Dictionary.dialogMessages.DELETE_SERVICE_TEMPLATE_SINGULAR_MESSAGE;
                dictionaryParameter = selectedRows[0] [ServiceTemplateColumnAttributes.SERVICE_TEMPLATE_NAME];
                warningMessage = warningMessage.replace("{0}", dictionaryParameter);
            } else {
                warningHeader = Dictionary.dialogMessages.HEADER_DELETE_SERVICE_TEMPLATES;
                warningMessage = Dictionary.dialogMessages.DELETE_SERVICE_TEMPLATES_MESSAGE;
                dictionaryParameter = selectedRows.length;

                warningMessage = warningMessage.replace("{0}", dictionaryParameter);
            }

            DialogUtils.showWarningDialogWithActionAndCancel(warningHeader, warningMessage, "", Dictionary.captions.OK, this.sendServerCallToDelete.bind(this, dictionaryParameter), "450px", undefined, true);
        },


        sendServerCallToDelete: function (dictionaryParameter) {

            var selectedRowIds = this.getSelectedIds();

            var isSingleRowDelete = (selectedRowIds.length === 1);

            var loadingMessage = (selectedRowIds.length === 1) ? Dictionary.loadingMessages.LOADING_DELETING_SINGULAR_SERVICE_TEMPLATE : Dictionary.loadingMessages.LOADING_DELETING_SERVICE_TEMPLATES;
            loadingMessage = loadingMessage.replace("{0}", dictionaryParameter);

            this.showLoadingAnimation(true, loadingMessage);

            ajaxService.deleteCall({
                url: UrlConstants.serviceTemplates.SERVICES_TEMPLATES_GRID_DATA,
                data: JSON.stringify(selectedRowIds),
                contentType: HttpConstants.mediaTypes.CONTENT_TYPE_APPLICATION_JSON,
                dataType: HttpConstants.mediaTypes.JSON,
                success: this.onDeleteSuccess.bind(this, isSingleRowDelete),
                error: this.onDeleteError.bind(this, isSingleRowDelete)
            });
        },

        onDeleteSuccess: function (isSingleRowDelete, response) {

            this.showLoadingAnimation(false);
            var toastMsg = (isSingleRowDelete) ? Dictionary.toasts.SERVICE_TEMPLATE_DELETE_SINGULAR_SUCCESS_TOAST : Dictionary.toasts.SERVICE_TEMPLATES_DELETE_SUCCESS_TOAST;
            this.handleRefresh(toastMsg);

        },

        onDeleteError: function (isSingleRowDelete, model, response) {

            this.showLoadingAnimation(false);
            if (DialogUtils.isSecurityDeniedResponse(response)) {  // unrecoverable (will have to re-login again)

                DialogUtils.showForbiddenDialog(Dictionary.forbiddenActionMessages.DELETE_SERVICE_TEMPLATES);

            } else {

                var errorHeader = (isSingleRowDelete) ? Dictionary.dialogMessages.HEADER_UNABLE_TO_DELETE_SERVICE_TEMPLATE : Dictionary.dialogMessages.HEADER_UNABLE_TO_DELETE_SERVICE_TEMPLATES;

                DialogUtils.showError(errorHeader, response);
            }
        },

        /**
         * This loading animation shall block out the whole page
         * whilst delete is on-going (no access to top section buttons)
         *
         * @param isShow - if true the loader is displayed, otherwise it is destroyed
         */
        showLoadingAnimation: function (isShow, loadingMessage) {

            this.eventBus.publish(Constants.events.LOADING_EVENT, isShow, loadingMessage);
        }

    });
});
