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
 * Date: 11/12/17
 */
define([
    'jscore/core',
    '../../Dictionary',

    'eso-commonlib/AjaxService',
    'eso-commonlib/Constants',
    'eso-commonlib/UrlConstants'


], function (core, Dictionary, ajaxService, Constants, UrlConstants) {
    'use strict';

    /**
     * This class handling server calls, etc.,
     * associate with selecting a service template from form select box
     *
     * This will load both parameters for Details tab
     * and make call to fetch work flows associate with the
     * selected service template
     *
     * (publishes : Constants.events.SERVICE_TEMPLATE_SELECTED which will
     * invoke the call for work-flows)
     */

    return core.AppContext.extend({

        /**
         *
         * @param options
         *          showLoadingAnimation: function shows loading animation
         *          eventBus:            context eventBus
         *          setParametersInForm: function (parameters)- loads parameters into details region form
         *          handleErrorResponse: function (response, actionForbiddenMessage)
         */
        init: function (options) {
            this.options = options ? options : {};

            this.showLoadingAnimation = this.options.showLoadingAnimation;
            this.eventBus = this.options.eventBus;
            this.setParametersInForm = this.options.setParametersInForm;
            this.handleErrorResponse = this.options.handleErrorResponse;


        },

        getServiceTemplateId: function () {
            return this.serviceTemplateId;
        },

        /**
         * Handle item selected in service template select box
         * @param serviceTemplateId   : Service Template Select Box Value (it is the id - not the name)
         * @param serviceTemplateName : Name displayed for the service template
         */
        handleServiceTemplateSelected: function (serviceTemplateId, serviceTemplateName) {

            this.serviceTemplateId = serviceTemplateId;

            this.makeServerCallToFetchInputs(serviceTemplateId, serviceTemplateName);

        },


        makeServerCallToFetchInputs: function (serviceTemplateId, selectedTemplateName) {

            var loadingMessage = Dictionary.loadingMessages.LOADING_INPUTS_FOR_SERVICE_TEMPLATE;
            loadingMessage = loadingMessage.replace("{0}", selectedTemplateName);
            this.showLoadingAnimation(true, loadingMessage);

            var inputsUrl = UrlConstants.serviceTemplates.INPUTS_FOR_SERVICE_TEMPLATE;
            inputsUrl = inputsUrl.replace("{0}", serviceTemplateId);    // Note passing the Id - not the name.

            ajaxService.getCall({
                url: inputsUrl,
                success: this.onFetchInputsSuccess.bind(this, serviceTemplateId),
                error: this.onFetchInputsError.bind(this, selectedTemplateName)
            });


        },

        onFetchInputsSuccess: function (serviceTemplateId, response) {

            this.showLoadingAnimation(false);

            var detailsParams = this.parseInputsResponseForForm(response);

            this.setParametersInForm(detailsParams);

            /* (if successful) keep same social link would have if launched with social link from ServiceTemplateRegion - back button consistency also */
            window.location.hash = Constants.lcHash.CREATE_SLICE_APP + "?" + Constants.hashQueryParams.SERVICE_TEMPLATE_ID_EQUALS + serviceTemplateId;

            /* e.g. fire to populate work flows for service template selected (not needed for now)*/
            this.eventBus.publish(Constants.events.SERVICE_TEMPLATE_SELECTED, serviceTemplateId);

        },

        onFetchInputsError: function (selectedTemplateName, model, response) {

            var forbiddenMessage = Dictionary.forbiddenActionMessages.LOAD_INPUTS_FOR_SERVICE_TEMPLATE;
            forbiddenMessage = forbiddenMessage.replace("{0}", selectedTemplateName);

            this.handleErrorResponse(response, forbiddenMessage);

        },

        /**
         * Parse response into a format that the form will be able to use.
         * Taking the "name" part of the response and converting it to a label
         *
         *
         * @param response  e.g. :  [{name:"ApnName, default : "", "description" }, {}, {}]
         * @return
         *  ApnName: {
         *      default: "apn.operator.com",
         *      description: "Access Point Name (APN) for GGSN/PDN Gateway ",
         *      type: "string"
         * },
         *  ChargingEnabled: {
         *      default: false,
         *      description: "Charging ",
         *      type: "boolean"
         *  }
         */
        parseInputsResponseForForm: function (response) {

            var parsedResponse = {};
            for (var i = 0; i < response.length; i++) {

                var responseItem = response[i];

                parsedResponse [ responseItem.name] = {};
                parsedResponse [ responseItem.name].mandatory = true;

                for (var attrName in responseItem) {
                    if (attrName !== 'name') {
                        parsedResponse [ responseItem.name][attrName] = responseItem[attrName];

                    }

                }
            }
            return parsedResponse;
        }

    });
});
