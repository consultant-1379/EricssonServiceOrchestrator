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
 * Date: 05/01/18
 */
define([
    'jscore/core',
    'uit!./ServiceTemplatesFilterForm.html',
    'i18n!eso-commonlib/dictionary.json',
    '../../columns/ServiceTemplateColumnAttributes'

], function (core, View, Dictionary, ServiceTemplateColumnAttributes) {
    'use strict';

    /**
     * Filter form for Service Template Grid
     *
     * Filter will be shown on a flyout with user choice to fill in text boxes for column to be filtered
     * based on columns presented in the html (handlebars file)
     */

    return core.Widget.extend({

        view: function () {
            var data = this.options.data || {};

            return new View({
                columnHeaders: Dictionary.columnTitles,
                data: this.getDataJSON(data)
            });
        },


        getDataJSON: function (data) {
            var dataJSON = {};
            for (var property in ServiceTemplateColumnAttributes) {
                if (ServiceTemplateColumnAttributes.hasOwnProperty(property)) {

                    var attribute = ServiceTemplateColumnAttributes[property];

                    dataJSON[attribute] = data[attribute];
                }
            }

            return dataJSON;


        },


        onDestroy: function () {
            this.findForm().destroy();
        },

        findForm: function () {
            return this.view.findById('esoServiceTemplates-filterForm');
        },

        /**
         * Reset all values on filter
         * form to am empty String
         */
        reset: function () {
            var form = this.findForm();
            var dataObj = form.getData();
            for (var prop in dataObj) {
                var attribute = dataObj[prop];
                if (attribute !== '') {
                    dataObj[prop] = '';
                }
            }

            form.setData(dataObj);
        },

        toJSON: function () {
            var data = this.findForm().getData(),
                filterAttr = {};

            Object.keys(data)
                .forEach(function (key) {

                    if (data[key]) {
                        // non empty filter input
                        filterAttr[key] = data[key];
                    }
                });
            return filterAttr;
        }

    });
});