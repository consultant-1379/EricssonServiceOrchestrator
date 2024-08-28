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
 * Date: 15/02/18
 */

define([
    'jscore/core',
    'i18n!eso-commonlib/dictionary.json',
    'uit!./JsonDisplayer.html',
    'eso-commonlib/BoldFontCell',
    'eso-commonlib/JSONValueCell',


    'widgets/Dialog',
    'widgets/InlineMessage',

    'widgets/Tree',
    'tablelib/Table',
    'widgets/Accordion',

    'tablelib/plugins/NoHeader'



], function (core, Dictionary, View, BoldFontCell, JSONValueCell, Dialog, InlineMessage, Tree, Table, Accordion, NoHeader) {
    'use strict';


    /**
     * Generic Widget to take JSON data and
     * make a Table from it  (noheader,
     * two column table for key and value)
     *
     * When the value is an array of JSON create a tree of tables for each
     * item and place at the end of the widget    (an expandable table does not
     * really give this effect - and content is very dynamic)
     *
     * (e.g. display JSON in a flyout - one for each execution step details)
     *
     */

    return core.Widget.extend({


        /**
         *  Initialise with a block of JSON
         *
         * @param options   e.g. for execution steps - a single step of data
         * data:     {
                id: "step0",
                name: "create",
                type: "Node",
                title: "create: fm-block-storage-1",
                node: "fm-block-storage-1",
                implementation: "scripts/create_storage.py",
                inputs: [
                    {
                        name: "size",
                        value: "1",
                        type: "integer"
                    }
                ],
                complete: false
            }
         */
        init: function (options) {
            this.options = options ? options : {};

            this.data = this.options.data;


        },

        view: function () {

            return new View();
        },


        /**
         * Method that will be called when the view is rendered
         */
        onViewReady: function () {

            // table of JSON, tree when JSON value is an array of JSON
            var tableAndTrees = this.createTableAndTrees(this.data);
            var table = tableAndTrees.table;
            var trees = tableAndTrees.trees;


            table.attachTo(this.getTableHolder());

            var treeHolder = this.getTreeHolder();
            if (trees && trees.length > 0) {
                for (var i = 0; i < trees.length; i++) {

                    trees[i].attachTo(treeHolder);


                }
            }

        },

        /**
         * Create Tree when value is an array
         * @param key                  e.g. "inputs"
         * @param dataArrayForKey      e.g. [{name: "size", value: "1", type: "integer"}],
         * @returns {widgets.Tree}
         */
        createTree: function (key, dataArrayForKey) {

            var treeItemData = [];

            var returnTrees = [];

            dataArrayForKey.forEach(

                function (jsonData) {

                    var tableAndTrees = this.createTableAndTrees(jsonData);

                    var content = tableAndTrees.table;

                    var children = [];

                    if (tableAndTrees.trees.length > 0) {
                        /* a value inside an array value - is also an array of json object(s) */
                        tableAndTrees.trees.forEach(function (tree) {

                            children = tree.options.items;

                        });

                        returnTrees = returnTrees.concat(tableAndTrees.trees);
                    }

                    treeItemData.push({
                        id: key,
                        labelContent: new Accordion({
                            title: key,
                            content: content
                        }),
                        label: key


                    });

                    if (children.length > 0) {
                        treeItemData.push({children: children});

                    }

                }.bind(this)
            );


            var displayTree = new Tree({
                items: treeItemData
            });


            return displayTree;

        },


        createTableAndTrees: function (jsonData) {

            var plugins = [
                new NoHeader()

            ];

            var data = [];

            var treeArray = [];
            for (var key in jsonData) {
                if (jsonData.hasOwnProperty(key)) {

                    if (jsonData[key] instanceof Array) {   // e.g. key "inputs" holds an array

                        if (jsonData[key].length > 0) {    // not {"inputs" : []}

                            // array handling arrays within json values also
                            treeArray = treeArray.concat(this.createTree(key, jsonData[key]));
                        }
                    } else {
                        data.push({col1: key, col2: jsonData[key]});
                    }
                }
            }

            var table = new Table({
                plugins: plugins,
                data: data,
                columns: [
                    {title: Dictionary.columnTitles.ATTRIBUTE, attribute: 'col1', cellType: BoldFontCell, width: '150px'},
                    {title: Dictionary.columnTitles.VALUE, attribute: 'col2', cellType: JSONValueCell}
                ]
            });

            return {table: table,
                trees: treeArray
            };
        },

        /* DOM interaction */

        getContentHolder: function () {
            return this.findElementByClassName("-content");
        },

        getTableHolder: function () {
            return this.findElementByClassName("-table");
        },


        getTreeHolder: function () {
            return this.findElementByClassName("-arrayTree");
        },


        /**
         * Adding prefix present on all divs in the widget's html
         * @param suffix   - end of the name
         * @returns {*}
         */
        findElementByClassName: function (suffix) {
            return this.getElement().find(".elEsoCommonlib-wJsonDisplayer" + suffix);
        }
    });

});
