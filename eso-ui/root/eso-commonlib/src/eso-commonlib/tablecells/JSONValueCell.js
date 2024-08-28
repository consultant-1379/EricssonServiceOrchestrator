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
 * Date: 20/02/18
 */
define([
    "tablelib/Cell",
    "jscore/core"
], function (Cell, core) {

    var SPACE = "&nbsp;&nbsp;&nbsp;&nbsp;";

    /**
     * Adding any special handling may wish for values pass  (use Constants class if more)
     */
    return Cell.extend({

        setValue: function (value) {

            var element = new core.Element();
            if (value && value.toString().toUpperCase() === 'TRUE'){

                element.getNative().innerHTML = "<div><i class='ebIcon ebIcon_simpleGreenTick'></i>" + SPACE + value + "</div>";

            } else {
                element.getNative().innerHTML =  value;
            }

            this.getElement().append(element);


        }
    });
});
