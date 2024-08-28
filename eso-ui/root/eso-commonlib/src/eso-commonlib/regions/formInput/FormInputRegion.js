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
 * Date: 08/12/17
 */
define([
    'jscore/core',
    '../../widgets/formInput/FormInputWidget',
    '../../utils/Utils'
], function (core, FormInputWidget, Utils) {
    'use strict';

    return core.Region.extend({


        /**
         * Start region with static form items
         * options :
         *       parameters : static part of form
         */
        onStart: function () {

            this.staticParameters = this.options.parameters;
            this.setParameters(this.staticParameters);
        },


        /**
         * Sets up form with dynamic part of form, replace anything prevously
         * displayed - (keeping the static data first)
         *
         * @param parameters
         */
        setParameters: function (parameters) {

            var existingData;

            /* replacing whole form so keep any thing set from static part of form */
            if (this.formWidget) {
                existingData = this.keepStaticData(this.formWidget.getData());
                this.formWidget.detach();
                this.formWidget.destroy();
                delete this.formWidget;
            }

            var allParams = Utils.mergeObjects(this.staticParameters, parameters);

            this.formWidget = new FormInputWidget({
                parameters: allParams
            });

            if (existingData) {
                this.formWidget.setData(existingData);
            }
            this.formWidget.attachTo(this.getElement());
        },

        // (NEED TO CLEAR EXISTING parameters when change select box items
        keepStaticData: function (data) {
            var keptData = {};
            for (var key in data) {
                if (this.staticParameters.hasOwnProperty(key)) {
                    keptData[key] = data[key];
                }
            }
            return keptData;

        },

        getData: function () {
            return this.formWidget.getData();
        },

        isValid: function (successFunction) {
            return this.formWidget.isValid(successFunction);
        },

        isFormBeingEdited: function () {
            return (this.formWidget) ? this.formWidget.isFormBeingEdited() : false;
        }

    });

});
