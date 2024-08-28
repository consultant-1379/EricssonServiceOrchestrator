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
    'jscore/core',
    'uit!./CreateSliceDetailsRegion.html',
    '../../Dictionary',

    './SelectServiceTemplateHandler',

    'widgets/InlineMessage',

    'eso-commonlib/FormInputRegion',

    'eso-commonlib/AjaxService',
    'eso-commonlib/Constants',
    'eso-commonlib/DialogUtils',

    'eso-commonlib/UrlConstants',
    'eso-commonlib/Utils'


], function (core, View, Dictionary, SelectServiceTemplateHandler, InlineMessage, FormInputRegion, ajaxService, Constants, DialogUtils, UrlConstants, Utils) {
    'use strict';

    /**
     * Class for details tab allowing user to choose a service template and view (modify) its associated inputs
     *
     */

    /**
     * Types which always have to appear on the form  (along with the dynamic data loaded when choose a service temple)
     * @type {{name: *, serviceTemplate: *}}
     */
    var staticDetailsTypes = {
        name: Dictionary.createSlice.NAME,
        serviceTemplate: Dictionary.createSlice.SERVICE_TEMPLATE
    };

    return core.Region.extend({



        View: View,


        /**
         * Initialise
         * @param options
         */
        init: function (options) {

            this.options = (options) ? options : {};

            this.eventBus = this.getEventBus();

            this.selectServiceTemplateHandler = new SelectServiceTemplateHandler({

                    showLoadingAnimation: this.showLoadingAnimation.bind(this),
                    eventBus: this.eventBus,
                    setParametersInForm: this.setParametersInForm.bind(this),
                    handleErrorResponse: this.handleErrorResponse.bind(this)
                }
            );
        },

        /**
         * Called when enter tab
         * Populate form select box (static form item) with service templates
         */
        onStart: function () {

            this.makeServerCallToFetchServiceTemplateList();

        },

        onStop: function () {
            if (this.formInputRegion) {
                this.formInputRegion.detach();
                this.formInputRegion.stop();

                delete this.formInputRegion;
            }
        },


        isDirty: function () {
            return  !(this.getName() === "" && typeof this.getServiceTemplateId() === "undefined");
        },

        /**
         * Information required for "Save & Install" call
         * @returns {*}   selected service template (name)
         */
        getServiceTemplateId: function () {
            if (Utils.isDefined(this.formInputRegion)) {
                return this.selectServiceTemplateHandler.getServiceTemplateId();

            } // undefined return initially if not previous in App
        },

        /**
         * Information required for "Save & Install" call
         */
        getName: function () {
            if (Utils.isDefined(this.formInputRegion)) {
                return this.formInputRegion.getData()[Dictionary.createSlice.NAME];  // static type name exists
            }
            return "";
        },

        /**
         * Information required for "Save & Install" call
         */
        getServiceTemplateInputs: function () {

            var data = this.formInputRegion.getData();
            for (var key in staticDetailsTypes) {
                delete data[staticDetailsTypes[key]];
            }
            return Utils.removeNewLines(data);

        },


        isValid: function (successFunction) {
            return this.formInputRegion && this.formInputRegion.isValid(successFunction);
        },


        makeServerCallToFetchServiceTemplateList: function () {

            this.showLoadingAnimation(true, Dictionary.loadingMessages.LOADING_EXISTING_SERVICE_TEMPLATES);

            ajaxService.getCall({
                url: UrlConstants.serviceTemplates.SERVICES_TEMPLATES_GRID_DATA,
                success: this.onFetchServiceTemplateListSuccess.bind(this),
                error: this.onFetchServiceTemplateListError.bind(this)
            });

        },

        onFetchServiceTemplateListSuccess: function (response) {

            this.showLoadingAnimation(false);

            var serviceTemplateItems = Utils.convertToSelectBoxItemsWhenHaveNamesWithIds(response.items);

            var preSelectedTemplateId = this.fetchDefaultSelectedServiceTemplateFromHash(serviceTemplateItems);  // can be undefined

            var staticParams = this.getStaticTemplateParameters(serviceTemplateItems, preSelectedTemplateId);
            this.setParametersInForm(staticParams);

        },

        onFetchServiceTemplateListError: function (model, response) {
            this.handleErrorResponse(response, Dictionary.forbiddenActionMessages.LOAD_SERVICE_TEMPLATES);
        },

        setParametersInForm: function (parameters) {

            if (!this.formInputRegion) {
                this.formInputRegion = new FormInputRegion({parameters: parameters});
                this.formInputRegion.start(this.getDetailsFormHolder());

            } else {
                this.formInputRegion.setParameters(parameters);
            }

        },

        /**
         *
         * @param serviceTemplateItems       All SelectBox  items
         * @param preSelectedTemplateValue   SelectBox value  (id) of selected item
         * @returns {{}}
         */
        getStaticTemplateParameters: function (serviceTemplateItems, preSelectedTemplateValue) {
            var defParams = {};

            defParams[staticDetailsTypes.name] = {   // TODO so not unique so server must change ?
                id: Dictionary.createSlice.NAME,
                type: "input",
                default: "",
                description: Dictionary.createSlice.NETWORK_SLICE_NAME_DESCRIPTION,
                mandatory: true,
                validationMessage: Dictionary.createSlice.NAME + Dictionary.createSlice.REQUIRED_MESSAGE
            };

            defParams[staticDetailsTypes.serviceTemplate] = {
                id: Dictionary.createSlice.SERVICE_TEMPLATE,
                type: "select",
                placeholder: Dictionary.createSlice.SELECT_FROM_LIST_PLACEHOLDER,
                validationMessage: Dictionary.createSlice.SERVICE_TEMPLATE + Dictionary.createSlice.REQUIRED_MESSAGE,
                items: serviceTemplateItems,
                default: preSelectedTemplateValue, //  default item presented in Service Template combo box
                description: Dictionary.createSlice.SERVICE_TEMPLATES_SELECT_BOX_DESCRIPTION,
                mandatory: true,
                callback: this.selectServiceTemplateHandler.handleServiceTemplateSelected.bind(this.selectServiceTemplateHandler)
            };

            return defParams;
        },


        handleErrorResponse: function (response, actionForbiddenMessage) {

            this.showLoadingAnimation(false);

            if (DialogUtils.isSecurityDeniedResponse(response)) {  // unrecoverable (will have to re-login again)

                DialogUtils.showForbiddenDialog(actionForbiddenMessage);
                this.showInlineMessage(DialogUtils.createForbiddenInlineMessage(actionForbiddenMessage));

            } else {
                this.showInlineMessage(DialogUtils.createErrorInlineMessage(response));
            }
        },

        /**
         * Fetch pre-selected template id added to the hash
         * e.g. If launched Create Slice application from another application and passed a
         * Service template to launch with
         *
         * @return  ID of Service Template taken from hash - only if it is present in the serviceTemplateItems select box list
         *          else return "undefined"
         */
        fetchDefaultSelectedServiceTemplateFromHash: function (serviceTemplateItems) {

            var preSelectedTemplateId = Utils.getItemValueFromQueryParams(window.location.hash, Constants.hashQueryParams.SERVICE_TEMPLATE_ID);

            var isFound = false;

            if (Utils.isDefined(preSelectedTemplateId)) {

                for (var i = 0; i < serviceTemplateItems.length; i++) {

                    if (serviceTemplateItems[i].value === preSelectedTemplateId) {   // select box has "value" as id

                        /* this will not be enough - will also need to change the default passed to form later to show selection */
                        this.selectServiceTemplateHandler.handleServiceTemplateSelected(preSelectedTemplateId, serviceTemplateItems[i].name);
                        isFound = true;
                        break;

                    }
                }
            }
            /* not clearing back the hash to Constants.lcHash.CREATE_SLICE_APP after read property from it - i.e. leave social links */

            if (isFound) {
                return preSelectedTemplateId;
            }

        },

        showInlineMessage: function (inlineMessage) {

            if (this.formInputRegion) {
                this.formInputRegion.stop();

            }
            inlineMessage.attachTo(Utils.removeAllChildrenFromElement(this.getInlineMessageHolder()));
        },

        /**
         * This loading animation shall block out the whole page
         * whilst call is on-going (no access to top section buttons)
         *
         * @param isShow - if true the loader is displayed, otherwise it is destroyed
         */
        showLoadingAnimation: function (isShow, loadingMessage) {

            this.eventBus.publish(Constants.events.LOADING_EVENT, isShow, loadingMessage);
        },

        /* DOM interactions */


        getDetailsFormHolder: function () {
            return this.findElementByClassName("-detailsForm");
        },

        getInlineMessageHolder: function () {
            return this.findElementByClassName("-inlineMessageHolder");
        },

        /**
         * Adding prefix present on all divs in the widget's html
         * @param suffix   - end of the name
         * @returns {*}
         */
        findElementByClassName: function (suffix) {
            return this.getElement().find(".eaEsoCreateSlice-rDetailsRegion" + suffix);
        }

    });

});
