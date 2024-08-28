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
 * Date: 18/02/18
 */
define([
    "tablelib/Cell",
    "jscore/core"

], function (Cell, core) {

    /**
     * Set all value in table cell to be presented in bold font
     * Assumes the values are Strings (which would be the case key of
     * a JSON response)
     */
    return Cell.extend({

        setValue: function (value) {

            var element = new core.Element();
            element.getNative().innerHTML = "<b>" + firstLetterToUpperCase(value) + "</b>";

            this.getElement().append(element);

        }
    });

    function firstLetterToUpperCase(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

});
