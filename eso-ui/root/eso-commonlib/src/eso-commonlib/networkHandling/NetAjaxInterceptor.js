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
 * Date: 24/11/17
 */
define([
    'jscore/ext/net',
    'i18n!eso-commonlib/dictionary.json',
    'eso-commonlib/HttpConstants',
    'eso-commonlib/DialogUtils'

], function (net, Dictionary, HttpConstants, DialogUtils) {

    /**
     * Class to intercept all calls to server (replace net.ajax) to add
     * some extra common handling (e.g. licence checks)
     *
     * Suitable for use when the error to display is replacing the whole container
     */
    return {

        /**
         * Intercepted AJAX call
         * @param options   regular AJAX options and add ones used below
         *
         */
        ajax: function (options) {

            var regularErrorHandler = options.error; // original error method to be called after this interceptor

            options.error = this.interceptedErrorCallWithStatusChecks.bind(this, regularErrorHandler);

            return net.ajax(options);
        },

        /**
         * Intercept method. Intercepts regular error handler with a licence check
         *
         * @param regularErrorHandler        Method to call to show normal error, clean up class,
         *                                   e.g. stop loading widget, etc.
         *
         * @param statusString     normal parameter for error message  (param 0)
         * @param response         normal parameter for error message  (param 1)
         * @param options          normal parameter for error message  (param 2)
         */
        interceptedErrorCallWithStatusChecks: function (regularErrorHandler, statusString, response, options) {


            if (!this.isShowingFullScreenErrorMessage(response)) {

                regularErrorHandler(statusString, response, options);

            }
        },

        /**
         * Display a full screen error message if response status code requires it
         * (replaces existing screen completely so used in limited cases)
         *
         * @param response    server error response
         * @returns {boolean} returns true if message has been displayed
         */
        isShowingFullScreenErrorMessage: function (response) {

            var status = response.getStatus();
            var header, content;

            switch (status) {

                case HttpConstants.codes.NO_BASIC_LICENCE:
                    header = Dictionary.dialogMessages.VALID_BASIC_LICENCE_HEADER;
                    content = Dictionary.dialogMessages.VALID_BASIC_LICENSE_REQUIRED_WARNING;
                    break;

                case HttpConstants.codes.NO_SERVER:
                    header = Dictionary.dialogMessages.SERVER_NOT_FOUND_HEADER;
                    content = Dictionary.dialogMessages.SERVER_NOT_FOUND_HEADER_WARNING;
                    break;

            }

            var showContainerMessage = (typeof header !== 'undefined');

            if (showContainerMessage) {
                DialogUtils.showFullScreenErrorMessage(header, content);
            }

            return showContainerMessage;
        }
    };
});
