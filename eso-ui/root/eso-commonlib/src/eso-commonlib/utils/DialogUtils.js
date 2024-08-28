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
 * Date: 31/07/17
 */
define([
    'i18n!eso-commonlib/dictionary.json',
    'jscore/core',
    'container/api',
    'widgets/Dialog',
    'widgets/Notification',
    'widgets/InlineMessage',
    'eso-commonlib/UrlConstants',
    'eso-commonlib/Constants',
    'eso-commonlib/HttpConstants',
    'eso-commonlib/Utils'
], function (Dictionary, core, container, Dialog, Notification, InlineMessage, UrlConstants, Constants, HttpConstants, Utils) {

    /**
     * Class containing some standard utils methods used throughout code
     * for Dialogs and Notifications
     */
    return {


        /**
         * Create the standard toast notification for operation success
         * @param dictionaryLabel    e.g. Dictionary.RECORD_SAVED
         * @returns {widgets.Notification}
         */
        createSuccessToastNotification: function (dictionaryLabel) {

            return new Notification({
                label: dictionaryLabel,
                icon: 'tick',
                color: 'green',
                showCloseButton: true,
                autoDismiss: true,
                showAsToast: true,
                autoDismissDuration: 5000
            });
        },

        /**
         * Show standard SDK Error Screen on container (on whole page - not a dialog over existing page)
         * e.g. If the application cannot be loaded use this full screen message.
         *
         * @param header  e.g.  'My Error Header'
         * @param content e.g.  'My error message goes into here. I can also put in <a href="#">links</a>. The text can also wrap around if its too long and
         *                       can add <p> tags for new lines'
         */
        showFullScreenErrorMessage: function (header, content) {

            container.getEventBus().publish('container:error', {
                header: header,
                content: content
            });
        },


        /**
         * Show error as inline message - usually a generic message, unless server passes something we can use from
         * dictionary
         *
         * @param errorResponse    error
         * @returns {widgets.InlineMessage}
         */
        createErrorInlineMessage: function (errorResponse) {

            var description;

            var handledServerMessage = this.getServerMessageFromErrorResponseIfAny(errorResponse);

            if (typeof handledServerMessage !== 'undefined') {
                description = handledServerMessage;
            } else {
                description = Dictionary.inline.SERVER_ISSUE_INLINE_MESSAGE;
            }

            Utils.log(description, errorResponse);

            return new InlineMessage({
                header: Dictionary.inline.UNABLE_TO_RETRIEVE_DATA,
                description: description,
                icon: "error"
            });
        },

        /**
         * Show dialog instead of window alert with custom header
         * (Preferred for TAF not to use an alert, as they can access ok button easier)
         *
         * This method is NOT used for server error handling !!
         *
         * @param message    message to display (can add "\n" for line separation)
         * @param header     (optional) message to display (as alert header)
         * @param dialogType (optional) dialog type supported by Dialog class (e.g. 'information') - default is 'warning' if not passed
         *
         */
        alert: function (message, header, dialogType) {


            if (typeof header === "undefined") {
                header = 'warning';
            }

            if (typeof dialogType === "undefined") {
                dialogType = 'warning';
            }

            var warningDialog = new Dialog({
                header: header,
                content: message,
                topRightCloseBtn: true,
                type: dialogType,
                buttons: [
                    {
                        caption: Dictionary.captions.OK,
                        color: 'darkBlue',
                        action: function () {
                            warningDialog.hide();
                        }
                    }
                ]
            });
            warningDialog.show();

        },


        /**
         * Show warning with cancel option
         * @param header                    Dialog header message
         * @param message                   Dialog content message  - HTML supported
         * @param messageSecondLine         Empty string if not required
         * @param actionCaption             Caption on blue button
         * @param actionMethod              Method to call when user presses action button
         * @param widthPixelsString        (optional) define specific width with pixel, e.g. '500px'
         * @param cancelMethod             (optional) method to call if user presses cancel
         * @paran topRightCloseBtnValue    (optional) false to hide top right close button (default true)
         */
        showWarningDialogWithActionAndCancel: function (header, message, messageSecondLine, actionCaption, actionMethod, widthPixelsString, cancelMethod, topRightCloseBtnValue) {

            var actionWarningDialog = new Dialog({
                header: header,
                //  content: message,
                optionalContent: messageSecondLine,
                type: 'warning',
                topRightCloseBtn: Utils.isDefined(topRightCloseBtnValue) ? topRightCloseBtnValue : true,
                buttons: [
                    {
                        caption: actionCaption,
                        color: 'darkBlue',
                        action: function () {
                            actionMethod.call();
                            actionWarningDialog.hide();
                        }
                    },
                    {
                        caption: Dictionary.captions.CANCEL,
                        action: function () {
                            actionWarningDialog.hide(); // allow progress dialogs in call to be shown
                            if (typeof cancelMethod === 'function') {  // optional
                                cancelMethod.call();
                            }

                        }

                    }

                ]
            });

            /* support passing HTML formatting in the message */
            actionWarningDialog.getElement().find(Constants.clientSDKClassNames.DIALOG_SECONDARY_TEXT).getNative().innerHTML = message;

            var maxWidth = (typeof widthPixelsString !== "undefined") ? widthPixelsString : Constants.DEFAULT_DIALOG_WIDTH;
            actionWarningDialog.view.getContentBlock().setStyle("max-width", maxWidth);

            actionWarningDialog.show();

        },


        /**
         * Central RBAC code check
         * @param response     server HTTP Response
         * @returns {boolean}  true if has status code corresponding to failing RBAC security check
         */
        isSecurityDeniedResponse: function (response) {

            return response.getStatus() === HttpConstants.codes.UNAUTHORIZED;
        },
        /**
         * Show errorDialog
         * Used rather than conventional showError function when error is thrown after successful ajax call/save to model
         * @param messageFirstLine  first message to display
         * @param messageSecondLine second message to display
         * @param header            header message (optional)
         */
        showMultiLineErrorAlert: function (messageFirstLine, messageSecondLine, header) {
            /* errorDialog exposed for junit - and to have one on screen */
            if (typeof header === "undefined") {
                header = ' ';
            }

            if (typeof this.errorDialog === "undefined") {

                this.errorDialog = new Dialog({
                    header: header,
                    content: messageFirstLine,
                    optionalContent: messageSecondLine,
                    type: 'error',
                    topRightCloseBtn: true,
                    buttons: [
                        {
                            caption: Dictionary.captions.OK,
                            color: 'darkBlue',
                            action: function () {
                                this.errorDialogHide();
                            }.bind(this)
                        }
                    ]
                });

                this.errorDialog.show();
            }
        },

        errorDialogHide: function () {
            this.errorDialog.hide();
            delete this.errorDialog;
        },

        /**
         * Show info dialog with retry (continue) option
         *
         * @returns {*}   retry dialog
         */
        showInfoAlertWithContinue: function (header, messageFirstLine, messageSecondLine, retryAction, noRetryAction, cancelButtonCaption, minWidthPixelsString) {

            if (typeof header === "undefined") {
                header = ' ';
            }

            // show one at time (as polling could have multiple dialogs if user does nothing)

            if (typeof this.retryDialog === "undefined") {

                this.retryDialog = new Dialog({
                    header: header,
                    content: messageFirstLine,
                    optionalContent: messageSecondLine,
                    type: 'information',
                    topRightCloseBtn: false, // makes no sense to avoid retry button
                    buttons: [
                        {
                            caption: Dictionary.captions.CONTINUE,
                            color: 'darkBlue',
                            action: function () {

                                retryAction.call();
                                this.retryDialogHide();

                            }.bind(this)
                        },
                        {
                            caption: (cancelButtonCaption) ? cancelButtonCaption : Dictionary.captions.NO,
                            action: function () {
                                noRetryAction.call();
                                this.retryDialogHide();

                            }.bind(this)
                        }
                    ]
                });

                if (typeof minWidthPixelsString !== "undefined") {  // to cover any underlying lying progress dialog
                    this.retryDialog.view.getContentBlock().setStyle("min-width", minWidthPixelsString);
                }


                this.retryDialog.show();
                return this.retryDialog;
            }
        },

        /* called externally too - see PollsCallsHandler */
        retryDialogHide: function () {
            if (typeof this.retryDialog !== 'undefined') {
                this.retryDialog.hide();
                delete this.retryDialog;
            }
        },

        /**
         * This can be used  for server specific messages
         * referred to in Dictionary.serverExceptionDescriptionKeys
         *
         * @param response The Server response with contain
         *
         *  {
             *   "userMessage": "Friendly error message to the user",   // could change to be looking for this one
             *   "httpStatusCode": 400,
             *   "internalErrorCode": "SERVICE_TEMPLATE_NAME_ALREADY_EXISTS",    // e.g. LOOKING IF THIS IS PRESENT
             *   "developerMessage": "Specific message to help developers solve the issue",
             *   "time": " ",
             *   "links": [
             *   {
             *      href: "http://example.com/oauth2status.html",
             *      rel: "help",
             *      title: "Service status information"
             *      }
             *     ],  "errorData": "[userName1, userName2]"
            };
         *  }
         * @returns {*}  description in error message (possibly some key in our Dictionary, e.g. "SERVICE_TEMPLATE_NAME_ALREADY_EXISTS"  (ref. serverExceptionDescriptionKeys)) or empty String
         */
        getKeyFromServerErrorResponse: function (response) {
            var responseText;

            if (response) {

                if (typeof response.getResponseJSON === 'function') {
                    try {
                        responseText = response.getResponseJSON()[ Constants.serverConstants.KEY_IN_EXCEPTION_USED_FOR_CUSTOMER_MESSAGES];
                    } catch (err) {
                        // possible JSON parse errors - sometimes even get here with response "Request Accepted"
                        Utils.log('Handling exception calling response.getResponseJSON : ' + err);
                        responseText = ((typeof response.getResponseText === 'function') ? response.getResponseText() : "");
                    }
                }
            }

            return  (typeof responseText !== 'undefined') ? responseText : "";   // empty String as used in indexOf compares in code
        },


        /**
         * Method to call for Consistent error dialog.
         *
         * Given standard AJAX error response,
         * error (model, response, options)
         * pass the response part and text to display
         *
         * All the information from the client is written to the header
         * with a standard body message (will not be displaying server response)
         *
         *
         * @param clientTitleHeader     client string for message, e.g. "Failed to perform something.". (will go on title)
         * @param response              second parameter from AJAX error callback containing status and response text
         */
        showError: function (clientTitleHeader, response) {

            var content, optionalContent;

            var handledServerMessage = this.getServerMessageFromErrorResponseIfAny(response);

            if (typeof handledServerMessage !== 'undefined') {
                content = handledServerMessage;
                optionalContent = '';
            } else {
                content = Dictionary.dialogMessages.STANDARD_DIALOG_ERROR_MESSAGE_CONTENT;
                optionalContent = Dictionary.dialogMessages.STANDARD_DIALOG_ERROR_MESSAGE_OPTIONAL_CONTENT;
            }


            this.showMultiLineErrorAlert(content, optionalContent, clientTitleHeader);

            Utils.log(clientTitleHeader, response);

        },

        /**
         * Server side may pass special messages, either via status code (e.g. 503 error), or by
         * passing in "internalErrorCode" that can be looked up in serverExceptionDescriptionKeys
         * area of dictionary,
         * e.g.   "internalErrorCode": "SERVICE_TEMPLATE_NAME_ALREADY_EXISTS",    // e.g. LOOKING IF THIS IS PRESENT
         *
         * Note will have already intercepted for full screen errors (e.g. No licence), in
         * the NetAjaxInterceptor prior to this point.
         *
         *
         * @param errorResponse   response for error from server
         * @returns {*}           In most cases this will be undefined
         */
        getServerMessageFromErrorResponseIfAny: function (errorResponse) {

            var handledServerMessage = Dictionary.serverExceptionDescriptionKeys [this.getKeyFromServerErrorResponse(errorResponse)];

            // also allow special status code checks also (e.g. 503) - one above take priority
            if (typeof handledServerMessage === 'undefined') {
                handledServerMessage = Dictionary.serverExceptionDescriptionKeys [("" + errorResponse.getStatus())];

            }
            return handledServerMessage; // in most cases undefined

        },

        /**
         * Method to call for Forbidden  warning dialog.
         * @param userAction    The CRUD operation which the user is not allowed to perform.
         *                      To suit the constants message
         * @param contentAction (optional) Extra parameter if the content has different text to substitute
         */
        showForbiddenDialog: function (userAction, contentAction) {

            var header = Dictionary.dialogMessages.UNAUTHORIZED_DIALOG_HEADER.replace('{0}', userAction);

            var action = (typeof contentAction !== 'undefined') ? contentAction : userAction;
            var content = Dictionary.dialogMessages.UNAUTHORIZED_DIALOG_CONTENT.replace('{0}', action);

            var messageSecondLine = Dictionary.dialogMessages.UNAUTHORIZED_DIALOG_CONTENT_SECOND_LINE;

            /* allow several messages to be shown  (local variable so can close the dialog) */
            var forbiddenDialog = new Dialog({
                header: header,
                type: 'error',
                content: content,
                optionalContent: messageSecondLine,
                topRightCloseBtn: true,
                buttons: [
                    {
                        caption: Dictionary.captions.OK,
                        action: function () {
                            forbiddenDialog.hide();
                        }

                    }
                ]
            });
            forbiddenDialog.show();
        },

        createForbiddenInlineMessage: function (userAction, contentAction) {
            var header = Dictionary.dialogMessages.UNAUTHORIZED_DIALOG_HEADER.replace('{0}', userAction);

            var action = (typeof contentAction !== 'undefined') ? contentAction : userAction;
            var description = Dictionary.dialogMessages.UNAUTHORIZED_DIALOG_CONTENT.replace('{0}', action);

            return new InlineMessage({
                header: header,
                description: description,
                icon: "error"
            });

        },

        /**
         * Creates a dialog (with message passed from caller )  for unsaved changes when leaving a page
         *
         * Useful when two lines in message
         *
         * @param leavePageAction  function to call when leave page (usually location change but sometimes may want no action, if
         *                         already at page you want - pass undefined in this case).
         * @param stayOnPageAction function usually undefined (but sometimes may want to do an action to revert to
         *                         older page, if now moved on)
         * @param contentMessage     Text (from dictionary) for line 1
         * @param messageSecondLine  (optional)  Text (from dictionary) for line 2
         * @returns  true if leaving the area and proceeding on to next page, else return false
         */
        createUnsavedChangesDialogLeavingPageWithMessage: function (leavePageAction, stayOnPageAction, contentMessage, messageSecondLine) {

            var titleHeader = Dictionary.dialogMessages.CONFIRM_NAVIGATION_HEADER;
            var stayButtonCaption = Dictionary.captions.STAY_ON_PAGE;
            var leaveButtonCaption = Dictionary.captions.LEAVE_PAGE;

            return this.createDialogWithTwoOptions(titleHeader, contentMessage, stayButtonCaption, leaveButtonCaption, leavePageAction, stayOnPageAction, messageSecondLine);

        },

        /**
         * Creates a dialog with message for unsaved changes
         * @param leavePageAction  function to call when leave page (usually location change but sometimes may want no action, if
         *                         already at page you want - pass undefined in this case).
         * @param stayOnPageAction function usually undefined (but sometimes may want to do an action to revert to
         *                         older page, if now moved on)
         * @param return true if leaving the area and proceeding on to next page, else return false
         */
        createUnsavedChangesDialog: function (leavePageAction, stayOnPageAction) {

            var titleHeader = Dictionary.dialogMessages.CONFIRM_NAVIGATION_HEADER;
            var contentMsg = Dictionary.dialogMessages.UNSAVED_CHANGES_WARNING;

            var stayButtonCaption = Dictionary.captions.STAY_ON_PAGE;
            var leaveButtonCaption = Dictionary.captions.LEAVE_PAGE;

            return this.createDialogWithTwoOptions(titleHeader, contentMsg, stayButtonCaption, leaveButtonCaption, leavePageAction, stayOnPageAction);

        },


        /**
         * Message should a refresh press be causing a refresh (reset) of data
         * @param refreshPageAction   function to call to refresh
         * @param stayOnPageAction    can be undefined
         * @returns {*}
         */
        createUnsavedChangesDialogOnRefresh: function (refreshPageAction, stayOnPageAction) {

            var titleHeader = Dictionary.dialogMessages.CONFIRM_REFRESH_HEADER;
            var contentMsg = Dictionary.dialogMessages.UNSAVED_CHANGES_ON_REFRESH_WARNING;

            var stayButtonCaption = Dictionary.captions.REFRESH_STAY_ON_PAGE;
            var leaveButtonCaption = Dictionary.captions.REFRESH_ON_PAGE;

            return this.createDialogWithTwoOptions(titleHeader, contentMsg, stayButtonCaption, leaveButtonCaption, refreshPageAction, stayOnPageAction);

        },


        createDialogWithTwoOptions: function (titleHeader, contentMsg, stayButtonCaption, leaveButtonCaption, leavePageAction, stayOnPageAction, messageSecondLine, widthPixelsString) {


            var isProceeding = false;

            /* exposed for junit */

            this.twoChoicesDialog = new Dialog({
                header: titleHeader,
                content: contentMsg,
                optionalContent: messageSecondLine,  // usually undefined
                type: 'warning',
                topRightCloseBtn: false,  // can not guarantee what would happen if cancel whole dilaog
                buttons: [
                    {
                        caption: leaveButtonCaption,
                        color: 'darkBlue',
                        action: function () {
                            if (typeof leavePageAction !== 'undefined') {
                                leavePageAction();
                            }
                            isProceeding = true;
                            this.unsavedChangesDialogHide();


                        }.bind(this)
                    },
                    {
                        caption: stayButtonCaption,

                        action: function () {
                            if (typeof stayOnPageAction !== 'undefined') {
                                stayOnPageAction();
                            }
                            isProceeding = false;
                            this.unsavedChangesDialogHide();
                        }.bind(this)
                    }

                ]
            });

            var maxWidth = (typeof widthPixelsString !== "undefined") ? widthPixelsString : Constants.DEFAULT_DIALOG_WIDTH;
            this.twoChoicesDialog.view.getContentBlock().setStyle("max-width", maxWidth);


            this.twoChoicesDialog.show();
            return isProceeding;
        },

        unsavedChangesDialogHide: function () {
            this.twoChoicesDialog.hide();
        }

    };


});
