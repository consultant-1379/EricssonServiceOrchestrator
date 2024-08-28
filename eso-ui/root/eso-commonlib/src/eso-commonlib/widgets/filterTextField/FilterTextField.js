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
 * Date: 04/12/17
 */
define([
    'jscore/core',
    'uit!./FilterTextField.html',
    'i18n!eso-commonlib/dictionary.json'
], function (core, View, Dictionary) {


    /**
     * Widget with input text box and changing filter icon.
     * When change the text calls the passed handler
     */

    return core.Widget.extend({

        ENTER_KEY_CODE : 13,

        view: function () {
            return new View(Dictionary.filterTextField);
        },

        /**
         * Initialise taking method passed from user of widget
         * @param options
         *             textFieldFilterHandler : Method to be called on every change of text box
         */
        init: function (options) {

            this.options = (options) ? options : {};
            this.textFieldFilterHandler = this.options.textFieldFilterHandler;
        },

        onViewReady: function () {
            this.filterTextField = this.getFilterInputTextField();
            this.filterOnIcon = this.getFilterOnIcon();
            this.filterOffIcon = this.getFilterOffIcon();

            this.inputEventId = this.filterTextField.addEventHandler('keyup', this.handleChangeInTextBoxText.bind(this));
            this.clearFilterEventId = this.filterOnIcon.addEventHandler('click', this.handleClearFilterIconClicked.bind(this));
            this.applyFilterEventId = this.filterOffIcon.addEventHandler('click', this.handleApplyFilterIconClicked.bind(this));

        },

        onDestroy: function () {

            if (this.filterTextField) {
                this.filterTextField.removeEventHandler('click', this.inputEventId);
                delete this.inputEventId;
                delete this.filterTextField;
            }
            if (this.clearFilterEventId) {
                this.filterOnIcon.removeEventHandler('keyup', this.clearFilterEventId);
                delete this.clearFilterEventId;
                delete this.filterOnIcon;
            }
            if (this.applyFilterEventId) {
                this.filterOffIcon.removeEventHandler('keyup', this.applyFilterEventId);
                delete this.applyFilterEventId;
                delete this.filterOffIcon;
            }
        },


        handleChangeInTextBoxText: function (event) {

            if (event.originalEvent.keyCode === this.ENTER_KEY_CODE){  // better performance if force ENTER key press
                var text = this.getValueText();
                this.upDateFilterIcon(text.length > 0);
                this.textFieldFilterHandler(text);
            }

        },

        getValueText : function(){
             return this.filterTextField.getValue();
        },

        handleClearFilterIconClicked: function (event) {
            this.filterTextField.setValue("");
            this.handleChangeInTextBoxText({originalEvent : {keyCode : this.ENTER_KEY_CODE}});
        },

        handleApplyFilterIconClicked : function(event){
            this.handleChangeInTextBoxText({originalEvent : {keyCode : this.ENTER_KEY_CODE}});
        },


        /**
         * Show an interactive "Filter On"  icon when text field is populated
         * This can be clicked to remove the text of the text field
         * @param isFilterOn     true if filter text is entered
         */
        upDateFilterIcon: function (isFilterOn) {
            this.getFilterOffIcon().setStyle("display", (isFilterOn ? "none" : "block"));
            this.getFilterOnIcon().setStyle("display", (isFilterOn ? "block" : "none"));
        },


        /* DOM interaction */

        getFilterInputTextField: function () {
            return this.findElementByClassName("-inputBox");
        },

        getFilterOffIcon: function () {
            return this.findElementByClassName("-filterOff");
        },

        getFilterOnIcon: function () {
            return this.findElementByClassName("-filterOn");
        },

        /**
         * Adding prefix present on all divs in the widget's html
         * @param suffix   - end of the name
         * @returns {*}
         */
        findElementByClassName: function (suffix) {
            return this.getElement().find(".elEsoCommonlib-wFilterTextField" + suffix);
        }
    });
});