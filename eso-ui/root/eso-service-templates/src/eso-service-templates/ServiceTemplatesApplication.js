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
 * Date: 04/01/18
 */
define([
    'jscore/core',
    'widgets/Loader',
    './Dictionary',
    'layouts/TopSection',

    'eso-commonlib/Constants',
    'eso-commonlib/Utils',
    './regions/servicetemplates/ServiceTemplatesRegion'

], function (core, Loader, Dictionary, TopSection, Constants, Utils, ServiceTemplatesRegion) {
    'use strict';

    /**
     * Entry class  for Service Template Management
     */

    return core.App.extend({

        /**
         * Called when the app is first instantiated in the current tab for the first time.
         */
        onStart: function () {

            this.addEventBusSubscribers();

            var topSection = new TopSection({
                breadcrumb: this.options.breadcrumb,
                title: this.options.properties.title,
                context: this.getContext(),
                defaultActions: this.getServiceTemplatesRegion().getDefaultActions()
            });

            topSection.setContent(this.getServiceTemplatesRegion());
            topSection.attachTo(this.getElement());

        },

        /**
         * This method is called when the user has left your app to view a different app.
         */
        onPause: function () {

        },

        /**
         * Called when the user navigates back to the application.
         */
        onResume: function () {
            this.addEventBusSubscribers();
            this.getServiceTemplatesRegion().handleRefresh();
        },

        /**
         * Called before the user is about to leave your app, either by navigating away or closing the tab.
         */
        onBeforeLeave: function () {
            this.removeEventBusSubscribers();
        },

        addEventBusSubscribers: function () {

            if (!Utils.isDefined(this.eventBusSubscriptions) || this.eventBusSubscriptions.length === 0) {
                var eventBus = this.getEventBus();
                this.eventBusSubscriptions = [];

                this.eventBusSubscriptions.push(eventBus.subscribe(Constants.events.LOADING_EVENT, this.showLoadingAnimation.bind(this)));

            }
        },

        removeEventBusSubscribers: function () {

            if (this.eventBusSubscriptions) {

                var subsLength = this.eventBusSubscriptions.length;
                var eventBus = this.getEventBus();
                for (var i = 0; i < subsLength; i++) {
                    eventBus.unsubscribe(this.eventBusSubscriptions[i]);
                }
                delete this.eventBusSubscriptions;
            }

        },

        getServiceTemplatesRegion: function () {
            if (typeof this.serverTemplateRegion === 'undefined') {

                this.serverTemplateRegion = new ServiceTemplatesRegion({
                    context: this.getContext()
                });
            }
            return this.serverTemplateRegion;
        },


        /**
         *
         * This loading animation shall block out the whole page
         * whilst process is on-going (no access to top section buttons)
         *
         * @param isShow - if true the loader is displayed, otherwise it is destroyed
         */
        showLoadingAnimation: function (isShow, loadingMessage) {
            if (isShow) {
                this.createLoadingAnimation(loadingMessage);
            } else {
                this.destroyLoadingAnimation();
            }
        },

        createLoadingAnimation: function (loadingMessage) {
            if (typeof this.loader === 'undefined') {
                this.loader = new Loader({
                        loadingText: loadingMessage }
                );
                this.loader.attachTo(this.getElement());
            }

        },

        destroyLoadingAnimation: function () {
            if (typeof this.loader !== 'undefined') {
                this.loader.destroy();
                delete this.loader;
            }
        }


    });

});
