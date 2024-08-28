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
    'jscore/core',
    'uit!./LastRefreshedLabel.html',
    'eso-commonlib/Utils'
], function (Dictionary, core, View, Utils) {


    /**
     * Widget to display after one minute which shows a label indicating last refresh time
     * updating as per design rules,
     *
     * 5/102 60-AOM 901 151 Uen
     * 3.1.4    Rule: UX _DataRetrievalTime_2, Data Last Retrieved Text
     *
     * e.g. "Last refreshed 6 minutes 6 seconds ago"
     *
     * (only to start displaying after a one minute period has elapsed)
     *
     * @type {*}
     */
    return core.Widget.extend({

            WAIT_BEFORE_DISPLAY_INTERVAL_MS: 30 * 1000, // CAUTION, see dictionary LAST_REFRESHED_START_MESSAGE

            ONE_SECOND_MS: 1 * 1000,

            SECONDS_IN_MINUTE: 60,

            SECONDS_IN_HOUR: 60 * 60,

            SECONDS_IN_DAY: 60 * 60 * 24,


            View: function () {

                return new View(Dictionary.lastRefreshedLabels);
            },


            init: function (options) {
                this.options = options || {};

                this.timeStatedLifeMS = Date.now();
            },

            onViewReady: function () {
                this.waitForIntervalBeforeDisplaying();
            },

            waitForIntervalBeforeDisplaying: function () {
                this.setVisible(false);
                setTimeout(this.performAfterInitialWaitAction.bind(this), this.WAIT_BEFORE_DISPLAY_INTERVAL_MS);
            },

            performAfterInitialWaitAction: function () {
                this.setVisible(true);
                this.startTimerInterval();
            },

            startTimerInterval: function () {

                this.intervalTimer = setInterval(this.updateDisplayLabel.bind(this), this.ONE_SECOND_MS);

            },

            getSecondsElapsedSinceStarted : function(){
                return Math.ceil ((Date.now() - this.timeStatedLifeMS) / 1000);

            },

            /**
             *  Replace the text in label
             *
             *  LAST_REFRESHED_DAYS_HOURS_MINS_SECS" : "Last refreshed {0}{1} {2}{3} {4}{5} {6}{7} ago",
             *
             *  e.g. to display "Last displayed 3 minutes 56 seconds ago"
             *
             *  (show days and hours if possible (without session time out) - i.e. as per design rules
             *
             */
            updateDisplayLabel: function () {

                var label = Dictionary.lastRefreshedLabels.LAST_REFRESHED_DAYS_HOURS_MINS_SECS;

                var obj = this.secondsToDaysHoursMins(this.getSecondsElapsedSinceStarted());

                label = replacePartLabel(label, "{0}", "{1}", obj.numDays, Dictionary.lastRefreshedLabels.DAY, Dictionary.lastRefreshedLabels.DAYS);
                label = replacePartLabel(label, "{2}", "{3}", obj.numHours, Dictionary.lastRefreshedLabels.HOUR, Dictionary.lastRefreshedLabels.HOURS);
                label = replacePartLabel(label, "{4}", "{5}", obj.numMinutes, Dictionary.lastRefreshedLabels.MINUTE, Dictionary.lastRefreshedLabels.MINUTES);
                label = replacePartLabel(label, "{6}", "{7}", obj.numSeconds, Dictionary.lastRefreshedLabels.SECOND, Dictionary.lastRefreshedLabels.SECONDS);

                this.getElement().setText(label);

            },

            secondsToDaysHoursMins: function (seconds) {
                var days = Math.floor(seconds / this.SECONDS_IN_DAY);
                var hours = Math.floor((seconds % this.SECONDS_IN_DAY) / this.SECONDS_IN_HOUR);
                var minutes = Math.floor(((seconds % this.SECONDS_IN_DAY) % this.SECONDS_IN_HOUR) / this.SECONDS_IN_MINUTE);
                var secsRemaining = ((seconds % this.SECONDS_IN_DAY) % this.SECONDS_IN_HOUR) % this.SECONDS_IN_MINUTE;

                return {
                    numDays: days,
                    numHours: hours,
                    numMinutes: minutes,
                    numSeconds: secsRemaining

                };
            },

            setVisible: function (isVisible) {
                Utils.showElementInline(this.getElement(), isVisible);

            },

            handleHouseKeepingOnClose: function () {

                if (this.intervalTimer) {
                    clearTimeout(this.intervalTimer);
                }
                this.detach();
                this.destroy();
            }
        }
    );

    function replacePartLabel(label, valuePartBrackets, itemPartBrackets, itemCount, singularItemString, multipleItemString) {
        if (itemCount !== 0) {

            var itemString = itemCount === 1 ? singularItemString : multipleItemString;

            label = label.replace(valuePartBrackets, itemCount);
            label = label.replace(itemPartBrackets, itemString);
        } else {
            label = label.replace(valuePartBrackets, '');
            label = label.replace(itemPartBrackets, '');
        }
        return label;
    }
});
