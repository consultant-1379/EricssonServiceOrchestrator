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
 * Date: 10/01/18
 */
define([
    "jscore/core",
    "eso-commonlib/paginatedlayout/GeneralPaginatedLayoutTable",

    'eso-commonlib/AjaxService',
    'tablelib/layouts/PaginatedTable',
    'tablelib/TableSettings'

],
    function (core, GeneralPaginatedLayoutTable, ajaxService, PaginatedTable, TableSettings) {
        'use strict';

        var sandbox, paginatedLayoutTableToTest, paginationOptions;


        var setUpSelectedRowsOnGrid = function () {

            var handleGridPopulationRowCount, selectChangeSelectedRowCount;
            paginatedLayoutTableToTest.selectedRows = {};

            paginatedLayoutTableToTest.selectedRows[0] = {};
            paginatedLayoutTableToTest.selectedRows["1"] = {};
            paginatedLayoutTableToTest.selectedRows[3] = {};
            paginatedLayoutTableToTest.selectedRows["4"] = {};

            sandbox.stub(paginatedLayoutTableToTest, "showEmptyGridMessage");
            sandbox.stub(paginatedLayoutTableToTest, "paginatedLayoutRowSelectionHandlerFunction", function () {
                return {
                    handleGridPopulation: function (rowCount) {
                        handleGridPopulationRowCount = rowCount;
                    },

                    selectChange: function (cachedSelection) {
                        selectChangeSelectedRowCount = cachedSelection;
                    },

                    selectAllOnAllPages: function () {

                    }
                }

            });


            sandbox.stub(paginatedLayoutTableToTest.paginatedTable, 'getDataInfoById', function () {

                // selectedRowsIdsAllPages = (2) ["0", "1"]     (i.e. some of above should get deleted in #updateSelectedRowsCache
                return [
                    {selected: true},
                    {selected: true},
                    {selected: false},
                    {selected: false}
                ];
            });


            sandbox.stub(paginatedLayoutTableToTest.paginatedTable, "getTable", function () {

                return {

                    addEventHandler: function () {

                        return "idOfHandler";
                    },

                    removeEventHandler: function (id) {

                    },

                    unselectAllRows: function () {
                    },

                    getSelectedRows: function () {
                        return [

                            {
                                getData: function () {
                                    return{id: "0", name: "zero"};
                                },
                                options: { model: {}}

                            },
                            {
                                getData: function () {
                                    return{"id": 1, name: "one"};
                                },
                                options: { model: {}}
                            }


                        ];
                    }

                };


            });

            // more code coverage to populate cache
            paginatedLayoutTableToTest.updateSelectedRowsCache();
        };

        describe('GeneralPaginatedLayoutTable widget', function () {


            beforeEach(function () {
                sandbox = sinon.sandbox.create();
            });

            afterEach(function () {
                sandbox.restore();
            });


            it("should not be undefined", function () {
                expect(GeneralPaginatedLayoutTable).not.to.be.undefined;
            });


            describe('GeneralPaginatedLayoutTable test methods', function () {


                beforeEach(function () {


                    sandbox.stub(ajaxService, 'getCall', function () {
                    });

                    var columns = [

                        {
                            title: "Name",
                            attribute: 'name',
                            width: '200px',
                            sortable: true,
                            resizable: true
                        },
                        {
                            title: 'Service Template File Name',
                            attribute: 'service_template_file_name',
                            width: '250px',
                            sortable: true,
                            resizable: true
                        }
                    ];


                    paginationOptions = {
                        columns: columns,
                        header: "Service Templates",
                        url: '/eso-services/v1/service_templates/grid',
                        getAllIdsURL: '/eso-services/v1/service_templates/grid/allIds',
                        filterFormClass : {},
                        paginatedLayoutRowSelectionHandler: {
                            selectAllOnAllPages: function () {
                            },
                            selectChange: function () {
                            }
                        },
                        showEmptyGridMessage: function (isShow) {
                        },
                        onErrorHandler: function () {
                        },
                        getCurrentContextActions: function () {
                        },

                        showFilteringOptions: true,
                        showSortingOptions: true
                    };


                    paginatedLayoutTableToTest = new GeneralPaginatedLayoutTable(paginationOptions);


                });

                describe('onViewReady tests', function () {

                    beforeEach(function () {
                        paginatedLayoutTableToTest.onViewReady();
                    });

                    it("created a PaginatedTable using tablelib/layouts/PaginatedTable", function () {

                        expect(paginatedLayoutTableToTest.paginatedTable instanceof PaginatedTable).to.equal(true);


                    });

                    it("should send an expected URL in two ajax calls", function () {

                        var expectedURL = "/eso-services/v1/service_templates/grid?offset=0&limit=50&sortAttr=name&sortDir=asc&filters={}";
                        var expectedIdsURL = "/eso-services/v1/service_templates/grid/allIds";

                        expect(expectedURL).to.equal(ajaxService.getCall.getCall(0).args[0].url);
                        expect(expectedIdsURL).to.equal(ajaxService.getCall.getCall(1).args[0].url);

                    });


                });

                describe('onDestroy tests', function () {

                    it("deletes the grid", function () {

                        expect(paginatedLayoutTableToTest.paginatedTable).not.to.be.undefined;

                        paginatedLayoutTableToTest.onDestroy();

                        /* not stubbing methods as want to exercise code */
                        expect(paginatedLayoutTableToTest.paginatedTable).to.be.undefined;

                    });
                });

                describe('getGridRowCount tests', function () {

                    it("fails safe to 0 when nothing present", function () {
                        // fail if SDK change #getDataInfoById
                        var actual = paginatedLayoutTableToTest.getGridRowCount();
                        expect(0).to.equal(actual);

                    });

                    it("can return expected number of rows  (unpublished #getDataInfoById length)", function () {

                        sandbox.stub(paginatedLayoutTableToTest.paginatedTable, 'getDataInfoById', function () {

                            return [
                                {selected: true},
                                {selected: false},
                                {selected: false}
                            ];
                        });

                        var actual = paginatedLayoutTableToTest.getGridRowCount();
                        expect(3).to.equal(actual);

                    });
                });


                describe('removeEventHandlers tests', function () {

                    it("deletes event ids", function () {

                        paginatedLayoutTableToTest.addEventHandlers();

                        expect(paginatedLayoutTableToTest.selectAllRowsEventHandlerId).not.to.be.undefined;
                        expect(paginatedLayoutTableToTest.selectPageEventHandlerId).not.to.be.undefined;
                        expect(paginatedLayoutTableToTest.selectChangeEventHandlerId).not.to.be.undefined;

                        paginatedLayoutTableToTest.removeEventHandlers();

                        expect(paginatedLayoutTableToTest.selectAllRowsEventHandlerId).to.be.undefined;
                        expect(paginatedLayoutTableToTest.selectPageEventHandlerId).to.be.undefined;
                        expect(paginatedLayoutTableToTest.selectChangeEventHandlerId).to.be.undefined;


                    });
                });


                describe('clearAllRowSelectionOnAllPages tests', function () {

                    beforeEach(function () {

                        setUpSelectedRowsOnGrid();

                    });


                    it("successfully calls #onTableSelectionClear (unpublished method)", function () {

                        /* no stubbing to excercise real code */

                        var isEmpty = Object.keys(paginatedLayoutTableToTest.selectedRows).length === 0 && paginatedLayoutTableToTest.selectedRows.constructor === Object;

                        expect(false).to.equal(isEmpty);

                        paginatedLayoutTableToTest.clearAllRowSelectionOnAllPages();

                        isEmpty = Object.keys(paginatedLayoutTableToTest.selectedRows).length === 0 && paginatedLayoutTableToTest.selectedRows.constructor === Object;

                        expect(true).to.equal(isEmpty);


                    });
                });


                describe('handleOnFetchSuccess tests', function () {

                    var handleGridPopulationRowCount, selectChangeSelectedRowCount;
                    beforeEach(function () {

                        paginatedLayoutTableToTest.cachedNumPrevSelectedRows = 2;

                        sandbox.stub(paginatedLayoutTableToTest, "showEmptyGridMessage");
                        sandbox.stub(paginatedLayoutTableToTest, "paginatedLayoutRowSelectionHandlerFunction", function () {
                            return {
                                handleGridPopulation: function (rowCount) {
                                    handleGridPopulationRowCount = rowCount;
                                },

                                selectChange: function (cachedSelection) {
                                    selectChangeSelectedRowCount = cachedSelection;
                                }
                            }

                        });


                    });


                    it("calls to show our #showEmptyGridMessage when zero rows returned with true as param", function () {

                        paginatedLayoutTableToTest.handleOnFetchSuccess(0);
                        expect(paginatedLayoutTableToTest.showEmptyGridMessage.getCall(0).calledWith(true)).to.equal(true);


                    });

                    it("calls to show our #showEmptyGridMessage when rows returned with false as param", function () {


                        paginatedLayoutTableToTest.handleOnFetchSuccess(3);

                        expect(paginatedLayoutTableToTest.showEmptyGridMessage.getCall(0).calledWith(false)).to.equal(true);

                    });

                    it("calls to show our #handleGridPopulation when rows returned", function () {


                        paginatedLayoutTableToTest.handleOnFetchSuccess(6);

                        expect(handleGridPopulationRowCount).to.equal(6);

                    });

                    it("calls to show our #selectChange with current selected rows", function () {

                        paginatedLayoutTableToTest.handleOnFetchSuccess(6);

                        expect(selectChangeSelectedRowCount).to.equal(2);  // same as  paginatedLayoutTableToTest.cachedNumPrevSelectedRows

                    });

                });


                describe('contextMenuEventHandler tests', function () {

                    beforeEach(function () {


                        sandbox.stub(paginatedLayoutTableToTest.paginatedTable, "getTable", function () {

                            return {

                                addEventHandler: function () {

                                    return "idOfHandler";
                                },

                                removeEventHandler: function (id) {

                                }
                            };


                        });


                    });


                    it("creates a contextMenusEventId", function () {

                        expect(paginatedLayoutTableToTest.contextMenusEventId).to.be.undefined;

                        paginatedLayoutTableToTest.addTableContextMenuEventHandlerOnce();

                        expect(paginatedLayoutTableToTest.contextMenusEventId).not.to.be.undefined;


                    });

                    it("remove a contextMenusEventId", function () {

                        paginatedLayoutTableToTest.addTableContextMenuEventHandlerOnce();

                        expect(paginatedLayoutTableToTest.contextMenusEventId).not.to.be.undefined;

                        paginatedLayoutTableToTest.removeTableContextMenuEventHandler();

                        expect(paginatedLayoutTableToTest.contextMenusEventId).to.be.undefined;


                    });
                });


                describe('disableOrHideGridOptions tests', function () {

                    beforeEach(function () {

                        sandbox.stub(paginatedLayoutTableToTest, "getSelectedInfoHolder", function () {

                            var elem = document.createElement("div");
                            var elemChild = document.createElement("div");
                            elem.textContent = " Selected (3) - Clear";

                            elem.appendChild(elemChild);


                            return {
                                getNative: function () {
                                    return elem;
                                }
                            };
                        });
                    });

                    it("disableOrHideGridOptions sets the Selected Text to a fixed String", function () {

                        paginatedLayoutTableToTest.disableOrHideGridOptionsOutSideTimer();
                        expect(paginatedLayoutTableToTest.textNotToChangeWhileDisabled).to.equal(" Selected (3) ");


                    });
                });


                describe('isGridDisabled tests', function () {

                    it("returns false if nothing found", function () {

                        var result = paginatedLayoutTableToTest.isGridDisabled();
                        expect(result).to.equal(false);


                    });
                });


                describe('rowSelectionChangeHandler tests', function () {

                    beforeEach(function () {

                        paginatedLayoutTableToTest.addEventHandlers();
                        paginatedLayoutTableToTest.isSelectAllCheckActive = true;   // just for coverage (out mocks do not clear)

                        setUpSelectedRowsOnGrid();


                    });

                    it("Caches selected Rows", function () {
                        paginatedLayoutTableToTest.paginatedTable.trigger("select:change");
                        var selectedRowCount = Object.keys(paginatedLayoutTableToTest.selectedRows).length;

                        expect(2).to.equal(selectedRowCount);   // see setUpSelectedRowsOnGrid has two selected rows
                        expect(2).to.equal(paginatedLayoutTableToTest.cachedNumPrevSelectedRows);

                    }); //this.isGridDisabled()


                    it("Disables if grid is disabled", function () {

                        sandbox.stub(paginatedLayoutTableToTest, "isGridDisabled", function () {
                            return true;
                        });
                        sandbox.stub(paginatedLayoutTableToTest, "disableOrHideSelectedText", function () {
                        });
                        paginatedLayoutTableToTest.paginatedTable.trigger("select:change");

                        expect(paginatedLayoutTableToTest.disableOrHideSelectedText.callCount).to.equal(1);

                    });


                });


                describe('getSelectedRows tests', function () {


                    it("returns expected selected rows when empty", function () {

                        var actual = paginatedLayoutTableToTest.getSelectedRows();

                        expect(actual.length).to.equal(0);

                    });

                    it("returns expected selected rows not empty", function () {

                        sandbox.stub(paginatedLayoutTableToTest.paginatedTable, "getSelectedIds", function () {
                            return ["1", 3, 5];
                        });


                        sandbox.stub(paginatedLayoutTableToTest.paginatedTable, "getTable", function () {
                            return {
                                getSelectedRows: function () {
                                    return [  // some fake rows
                                        {getData: function () {
                                            return {id: "1", name: "one"}
                                        },
                                            options: {model: {}}},
                                        {getData: function () {
                                            return {id: 3, name: "three"}
                                        },
                                            options: {model: {}}},
                                        {getData: function () {
                                            return {id: 5, name: "five"}
                                        },
                                            options: {model: {}}}
                                    ];

                                }};

                        });
                        paginatedLayoutTableToTest.updateSelectedRowsCache();
                        var actual = paginatedLayoutTableToTest.getSelectedRows();

                        expect(actual.length).to.equal(3);


                    });
                });


                describe('selectAllRowsOnAllPagesHandler tests', function () {

                    beforeEach(function () {

                        paginatedLayoutTableToTest.addEventHandlers();

                        setUpSelectedRowsOnGrid();


                    });

                    it("selecting all rows empties the selected rows (pass [] to server)", function () {

                        paginatedLayoutTableToTest.paginatedTable.trigger('select:all');

                        var selectedRowCount = Object.keys(paginatedLayoutTableToTest.selectedRows).length;

                        expect(0).to.equal(selectedRowCount);

                    });
                });


                describe('getTableSettingsForms tests', function () {


                    it("the grid should have expected content type)", function () {

                        var tableSettingForm = paginatedLayoutTableToTest.paginatedTable.options.getTableSettingsForms();

                        expect(tableSettingForm[0].content instanceof TableSettings).to.equal(true);

                    });

                });


                describe('getPlugins tests', function () {


                    it("the grid should have expected plugins)", function () {

                        var plugins = paginatedLayoutTableToTest.paginatedTable.options.getPlugins();

                        var pluginCount = plugins.length;

                        expect(7).to.equal(pluginCount); // 7 as no expandable rows

                    });
                });

            });
        });
    });

