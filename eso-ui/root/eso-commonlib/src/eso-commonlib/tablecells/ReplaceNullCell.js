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
 * Date: 08/01/18
 */
define([
    "tablelib/Cell"

], function (Cell) {

    /**
     * The server side is passing "null"
     * which we must translate to display on the grid cell
     */
    return Cell.extend({

        setValue: function (value) {

            var displayText = replaceNullIfFound(value);
            this.getElement().setText(displayText);

        }
    });

    function replaceNullIfFound(value) {
        return(value === null) ? "" : value;  // some display that will not upset filter

    }
});

