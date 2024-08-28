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
 * Date: 05/01/18
 */

define([
    'i18n!eso-commonlib/dictionary.json',
    'jscore/core',
    'uit!./RefreshWidget.html',
    'widgets/Button',
    'eso-commonlib/Utils',
    'eso-commonlib/Constants'
], function (Dictionary, core, View, Button, Utils, Constants) {


    /**
     * Refresh widget to be placed on the action bar
     * Function is to reload grid in page or whatever is called
     * by a #handleRefresh method in item to refresh
     *
     * @type {*}
     */
    return Button.extend({       /* extending button to suit using MultiButtons */

            View: function () {

                return new View({REFRESH: Dictionary.captions.REFRESH});
            },


            init: function (options){
                this.options = options || {};
            },

            onViewReady: function () {
                this.setVisible(false);  // default until itemToRefresh is suitable
            },


            /**
             * Reset item (e.g. region) to refresh
             *
             * If the region contains  #handleRefresh method,
             * then this component will implement that method on mouse press.
             *
             * Other wise this component shall not be visible.
             *
             * @param item region or widget containing #handleRefresh method if want
             *                       this refresh widget to be visible
             */
            resetItemToRefresh: function (item) {

                if (typeof item !== 'undefined') {
                    this.itemToRefresh = item;

                    this.removeRefreshActionListeners();  // or will have multiple calls should #resetItemToRefresh be over-called

                    if (this.isRefreshApplicable()) {
                        this.setVisible(true);
                        this.addRefreshActionListener();
                    } else {
                        this.setVisible(false);
                    }
                }

            },

            isRefreshApplicable: function () {
                return this.itemToRefresh && typeof this.itemToRefresh.handleRefresh === 'function';
            },


            setVisible: function (isVisible) {
                Utils.showElementInline(this.getElement(), isVisible);

            },

            addRefreshActionListener: function () {

                this.refreshIconEventId = this.getRefreshIconHolder().addEventHandler('click', refreshAction.bind(this));
            },


            handleHouseKeepingOnClose: function () {

                this.removeRefreshActionListeners();

            },

            removeRefreshActionListeners: function () {

                if (this.refreshIconEventId) {
                    var iconHolder = this.getRefreshIconHolder();
                    if (iconHolder) {
                        iconHolder.removeEventHandler(this.refreshIconEventId);
                        delete this.refreshIconEventId;
                    }
                }
            },


            /* DOM interactions */

            getRefreshIconHolder: function () {
                return this.getElement().find(".elEsoCommonlib-wRefresh-iconHolder");
            }
        }
    );

    function refreshAction() {

        this.itemToRefresh.handleRefresh();
    }
});
