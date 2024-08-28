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
 * Date: 06/02/18
 */
define([
    "i18n!eso-topologylib/dictionary.json",
    "i18n!eso-commonlib/dictionary.json",
    "eso-commonlib/Utils"

], function (i18n_app, i18n_common, Utils) {

        /**
         * Class returns Merged dictionary so all common dictionary keys can be accessed
         * (i.e will have just one dictionary shared across all apps)
         */
        return  Utils.mergeObjects(i18n_app, i18n_common);

    }
);

