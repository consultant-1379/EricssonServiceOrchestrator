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
    'i18n!eso-commonlib/dictionary.json',
    './ServiceTemplateColumnAttributes',
    'eso-commonlib/ReplaceNullCell'
],
    function (Dictionary, ServiceTemplateColumnAttributes, ReplaceNullCell) {
        'use strict';
        return {
            columns: [

                /* as used with table settings, columns can not be removed and reordered,
                 * so can not really assign an auto-fit column (no width) so well
                 * (Tried and column disappeared on grid re-create when had all columns)
                 */
                {
                    title: Dictionary.columnTitles.SERVICE_TEMPLATE_NAME,
                    attribute: ServiceTemplateColumnAttributes.SERVICE_TEMPLATE_NAME,
                    width: '200px',
                    sortable: true,
                    resizable: true
                },
                {
                    title: Dictionary.columnTitles.SERVICE_TEMPLATE_FILE_NAME,
                    attribute: 'service_template_file_name',
                    width: '250px',
                    sortable: true,
                    resizable: true
                },
                {
                    title: Dictionary.columnTitles.UP_LOAD_TIME,
                    attribute: ServiceTemplateColumnAttributes.UP_LOAD_TIME,
                    width: '200px',
                    sortable: true,
                    resizable: true
                },
                {
                    title: Dictionary.columnTitles.DESCRIPTION,
                    attribute: ServiceTemplateColumnAttributes.DESCRIPTION,
                    cellType: ReplaceNullCell,
                    width: '300px',
                    sortable: true,
                    resizable: true
                }
            ]
        };
    });


