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
    'jscore/core',
    'i18n!eso-commonlib/dictionary.json',
    'uit!./FileUpLoadDialog.html',

    'widgets/Dialog',
    'widgets/InlineMessage',
    'widgets/Loader',

    'eso-commonlib/AjaxService',
    'eso-commonlib/Constants',
    'eso-commonlib/DialogUtils',
    'eso-commonlib/FetchWorkFlowHandler',
    'eso-commonlib/HttpConstants',
    'eso-commonlib/Utils',
    'eso-commonlib/UrlConstants'


], function (core, Dictionary, View, Dialog, InlineMessage, Loader, ajaxService, Constants, DialogUtils, FetchWorkFlowHandler, HttpConstants, Utils, UrlConstants) {
    'use strict';


    /**
     * Generic Widget displaying File UpLoad Dialog
     *
     * For Example Install Service Template options in a Dialog Box or Install Plugins
     *
     * Will make a call POST action to upload a user selected file to the server.
     *
     * Can also add form fields to display (name and description)
     *
     *
     */

    return core.Widget.extend({


        /**
         * Construct generic upload dialog
         * @param options
         *         postURL        : Address where to upload form, e.g. UrlConstants.serviceTemplates.SERVICES_TEMPLATES_GRID_DATA
         *         eventBus       : eventBus to publish-subscribe to
         *         handleRefresh  : Method that can refresh the grid displaying files (with toast)
         *         dialogHeader   : e.g.  Dictionary.titles.INSTALL_SERVICE_TEMPLATE
         *         hideNameField  : true to hide name field (default false)    (optional)
         *         hideDescriptionField  : true to hide description field (default false)     (optional)
         *         namePlaceHolder : e.g.  serviceTemplates.SERVICE_TEMPLATE_NAME_PLACEHOLDER,  (applicable if showing the name field)  (optional)
         *
         */
        init: function (options) {
            this.options = options ? options : {};

            this.postURL = this.options.postURL;
            this.handleRefresh = this.options.handleRefresh;
            this.eventBus = this.options.eventBus;
            this.dialogHeader = this.options.dialogHeader;

            // optional
            this.hideNameField = (this.options.hideNameField) ? this.options.hideNameField : false;
            this.hideDescriptionField = (this.options.hideDescriptionField) ? this.options.hideDescriptionField : false;
            this.namePlaceHolder = (this.options.namePlaceHolder) ? this.options.namePlaceHolder : Dictionary.fileUpLoad.GENERIC_NAME_PLACE_HOLDER;

        },

        view: function () {

            var viewExtra = {NAME_PLACEHOLDER: this.namePlaceHolder,
                isShowingNameField: (!this.hideNameField),
                isShowingDescriptionField: (!this.hideDescriptionField)};

            return new View(Utils.mergeObjects(Dictionary.fileUpLoad, viewExtra));
        },


        /**
         * Entry point - show a Dialog containing this content
         */
        showInstallFileDialog: function () {

            var installDialog = new Dialog({
                header: this.dialogHeader,
                content: this,
                topRightCloseBtn: true
            });

            this.parentDialog = installDialog;

            this.setDialogButtonsInstallEnabled(false);

            this.parentDialog.show();

            this.addEventHandlers();

        },

        /**
         * Method that will be called when the view is rendered
         */
        onViewReady: function () {


        },

        addEventHandlers: function () {
            this.hideHandlerEventId = this.parentDialog.addEventHandler("hide", this.cleanUpOnCloseAction.bind(this));

            this.fileChangeEvent = this.addFileSelectionChangeHandler();

            if (!this.hideNameField) {
                this.nameChangeEvent = this.addNameFieldChangeHandler();
            }

        },

        removeEventHandlers: function () {
            if (this.parentDialog) {
                this.parentDialog.removeEventHandler(this.hideHandlerEventId);
                delete this.hideHandlerEventId;
                delete this.parentDialog;

            }
            if (this.fileChangeEvent) {
                this.fileChangeEvent.destroy();
            }
            if (this.nameChangeEvent) {
                this.nameChangeEvent.destroy();
            }
        },


        cleanUpOnCloseAction: function () {
            this.destroy();
        },

        onDestroy: function () {

            this.removeEventHandlers();
        },

        getInputtedName: function () {
            return this.getNameTextField().getValue();
        },

        getInputtedDescription: function () {
            return this.getDescriptionTextField().getValue();
        },

        /**
         * Method to call on Dialog "Install" button press
         */
        checkUserInputAndCallSuccessFunction: function () {

            this.sendServerCallToInstall();

        },

        isNameValid: function () {

            if (this.hideNameField) {
                return true;
            }
            var name = this.getInputtedName();
            return name !== "";
        },

        /**
         * Detecting "File" field changes
         * Called when change file in the file chooser
         * Getting the content for selected file,
         * every time file selection is changed
         */
        addFileSelectionChangeHandler: function () {

            var fileFieldElement = this.getFileField();
            var eventId = fileFieldElement.addEventHandler("change", function () {

                if (Utils.isDefined(this.fileSelected)) {
                    delete this.fileSelected;
                }
                // method getting file content selected
                this.fileSelected = fileFieldElement.getProperty("files")[0];

                this.setDialogButtonsInstallEnabled(this.isNameValid() && this.fileSelected instanceof File);

            }.bind(this));

            return eventId;

        },

        /**
         * Enable Install button when name (and file) are valid
         * Detecting "Name" field changes
         * @returns {*}
         */
        addNameFieldChangeHandler: function () {
            var nameField = this.getNameTextField();
            var eventId = nameField.addEventHandler("input", function () {

                var isFileSelected = (typeof this.fileSelected !== 'undefined'); // file selection creates form data

                this.setDialogButtonsInstallEnabled(this.isNameValid() && isFileSelected);

            }.bind(this));

            return eventId;
        },


        /**
         * Send POST to server with File (option available enter file and name)
         */
        sendServerCallToInstall: function () {

            var loadingMessage = Dictionary.loadingMessages.LOADING_INSTALLING_FILE;
            loadingMessage = loadingMessage.replace("{0}", this.fileSelected.name);


            this.showLoadingAnimation(true, loadingMessage);

            this.setDialogButtonsInstallEnabled(false);

            var formToPost = new FormData(this.getForm().getNative());   // HTML contains multipart/form-data set up


            // Note for development env - had to edit cdt-serve/proxy.json when using latest Node.js (v8.9.4)
            // to use  Buffer.byteLength(rawBody) not rawBody.length when handling multipart/form-data
            // (when used node v6.11.1 this same cdt-serve/proxy.json seemed to stip out data entirely.

            ajaxService.ajax({

                    url: this.postURL,
                    type: HttpConstants.methods.POST,
                    contentType:  false, // must be set for file uploads
                    processData: false,  // must be set for file uploads
                    data: formToPost,   // (let browser set the Content-Type (dataType) with boundary)
                    success: this.handleInstallActionSuccess.bind(this),
                    error: this.handleInstallActionError.bind(this)

                }

            );

        },

        handleInstallActionSuccess: function (response) {

            this.showLoadingAnimation(false);
            this.parentDialog.hide();

            var toastMsg = Dictionary.toasts.INSTALL_SUCCESS_TOAST;
            this.handleRefresh(toastMsg);
        },

        handleInstallActionError: function (model, response) {


            /* already are in a dialog - not creating more dialogs */

            this.showLoadingAnimation(false);

            var forbiddenMessage;

            if (HttpConstants.codes.OK === response.getStatus()) {

                this.handleInstallActionSuccess();

            } else if (DialogUtils.isSecurityDeniedResponse(response)) {  // unrecoverable (will have to re-login again)
                forbiddenMessage = Dictionary.forbiddenActionMessages.INSTALL_FILE_ON_SERVER;
            }

            // could be a duplicate name  TODO or UI could cache existing names here and show validation in html when input text
            this.handleErrorResponse(response, forbiddenMessage);
        },


        /**
         * Handling error (for fetching work-flows also)
         * Showing as inline messages - as we are a Dialog already
         */
        handleErrorResponse: function (response, forbiddenMessage) {
            if (Utils.isDefined(forbiddenMessage)) {  // unrecoverable (will have to re-login again)

                this.showInlineMessage(DialogUtils.createForbiddenInlineMessage(forbiddenMessage));

            } else {

                this.showInlineMessage(DialogUtils.createErrorInlineMessage(response));
            }

        },

        /**

         * @param isInstallEnabled
         */
        setDialogButtonsInstallEnabled: function (isInstallEnabled) {
            this.parentDialog.setButtons(getDialogButtons(isInstallEnabled, this.parentDialog, this.checkUserInputAndCallSuccessFunction.bind(this)));
        },


        showInlineMessage: function (inlineMessage) {

            Utils.removeAllChildrenFromElement(this.getContentHolder());

            inlineMessage.attachTo(this.getInlineMessageHolder());
        },


        /* Loading life cycle */

        /**
         * This loading animation shall block out the whole page
         * whilst install is on-going (no access to top section buttons)
         *
         * @param isShow - if true the loader is displayed, otherwise it is destroyed
         */
        showLoadingAnimation: function (isShow, message) {
            if (isShow) {
                this.createLoadingAnimation(message);
            } else {
                this.destroyLoadingAnimation();
            }
            // underneath this dialog also
            this.eventBus.publish(Constants.events.LOADING_EVENT, isShow, message);
        },

        createLoadingAnimation: function (message) {
            if (typeof this.loader === 'undefined') {
                this.loader = new Loader({
                    loadingText: message
                });
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

        getNameTextField: function () {
            return this.findElementByClassName("-nameTextField");
        },

        getDescriptionTextField: function () {
            return this.findElementByClassName("-descriptionTextField");
        },

        getFileField: function () {
            return this.findElementByClassName("-fileField");
        },

        getContentHolder: function () {
            return this.findElementByClassName("-content");
        },

        getInlineMessageHolder: function () {
            return this.findElementByClassName("-inlineMessageHolder");
        },

        getForm: function () {
            return this.findElementByClassName("-form");

        },


        /**
         * Adding prefix present on all divs in the widget's html
         * @param suffix   - end of the name
         * @returns {*}
         */
        findElementByClassName: function (suffix) {
            return this.getElement().find(".elEsoCommonlib-wInstall" + suffix);
        }

    });


    function getDialogButtons(isInstallEnabled, installDialog, installAction) {

        return [
            {
                caption: Dictionary.captions.INSTALL,
                color: 'darkBlue',
                enabled: isInstallEnabled,
                action: function () {
                    installAction();  // do not hide until know there is no error to display

                }
            },
            {
                caption: Dictionary.captions.CANCEL,
                action: function () {
                    installDialog.hide();
                }
            }
        ];

    }
});
