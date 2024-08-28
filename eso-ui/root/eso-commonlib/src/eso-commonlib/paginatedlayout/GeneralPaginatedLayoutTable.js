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
    'jscore/core',
    'i18n!eso-commonlib/dictionary.json',

    'container/api',
    'widgets/Loader',

    'eso-commonlib/AjaxService',
    'eso-commonlib/UrlConstants',
    'eso-commonlib/Constants',
    'eso-commonlib/Utils',

    'tablelib/layouts/PaginatedTable',
    'tablelib/TableSettings',

    'tablelib/plugins/ExpandableRows',
    'tablelib/plugins/Selection',
    'tablelib/plugins/ResizableHeader',
    'tablelib/plugins/SmartTooltips',
    'tablelib/plugins/StickyHeader',
    'tablelib/plugins/StickyScrollbar',
    'tablelib/plugins/RowEvents',
    'tablelib/plugins/SortableHeader',
    'tablelib/plugins/FixedHeader'

], function (core, Dictionary, container, Loader, ajaxService, UrlConstants, Constants, Utils, PaginatedTable, TableSettings, ExpandableRows, Selection, ResizableHeader, SmartTooltips, StickyHeader, StickyScrollbar, RowEvents, SortableHeader, FixedHeader) {

    /**
     * Class using SDK PaginatedTable to display server side paginated grid with sorting and filtering
     * (can be turned off)
     *
     * The list of selected ids is available from getSelectedIds.
     *
     */
    var GeneralPaginatedLayoutTable = core.Widget.extend({

        /**
         * SDK keeps selected Ids, but for our use cases we
         * need selected rows - as we get information from row cells
         */
        selectedRows: {},

        /**
         * To save "over publishing" to top section nav bar,
         * caching number of previous rows selected such that if
         * no condition changes that would affect top section buttons present,
         * no publish would be required
         */
        cachedNumPrevSelectedRows: 0,


        /**
         * Construct params
         * e.g
         * [===
         * var paginatedLayoutOptions = {
         *      columns: e.g. ServiceTemplateColumns.columns,
         *      filterFormClass :  Widget for FilterForm, e.g. ServiceTemplateFilterForm
         *      header: Dictionary.titles.SERVICE_TEMPLATE_TABLE_HEADER
         *      url: initial REST URI to service,
         *      urlQueryParams: e.g. {'networkTechnology': Constants.serverConstants.LTE},
         *      getAllIdsURL: REST URI to get all Ids
         *      expandableContent: expandableRowsContent,   [optional] if table has expandableRows
         *      paginatedLayoutRowSelectionHandler: this.paginatedLayoutRowSelectionHandler.bind(this),
         *        implementing :
         *            #selectAllOnAllPages
         *            #selectChange(selectedRowCount, this.cachedNumPrevSelectedRows)
         *            #handleGridPopulation   - initial grid population
         *
         *      showEmptyGridMessage: this.showEmptyGridMessage.bind(this),    (optional)
         *      onErrorHandler: this.onConflictsFetchError.bind(this),
         *      getCurrentContextActions: this.getCurrentContextActions.bind(this)
         *      fixedHeight : (if required) e.g. "350"
         *      showCheckBoxes : set if show checkboxes (default true)
         *
         *      showFilteringOptions : false,
         *      showSortingOptions : false
         * };
         *
         *  this.table = new GeneralPaginatedLayoutTable(paginatedLayoutOptions);
         *  this.table.attachTo(this.view.getCTableWidgetHolder());
         *  ===]
         *
         * @param options
         */
        init: function (options) {

            this.initOptions(options);

            this.DEFAULT_SORT_COLUMN = this.columns[0].attribute;
            this.DEFAULT_SORT_DIR = 'asc';

            this.columns[0].disableVisible = true; // Table Setting DR (not to allow no column selected)

        },

        onViewReady: function () {

            this.clearSelectedRowsCache();
            this.paginatedTable = this.createPaginatedLayoutTable();
            this.paginatedTable.attachTo(this.getElement());

            if (this.showCheckBoxes) {
                this.addEventHandlers();
            }

            this.showFilterOption(this.showFilteringOptions);

        },

        onDestroy: function () {

            this.clearSelectedRowsCache();

            if (this.paginatedTable) {
                this.removeEventHandlers();
                this.removeTableContextMenuEventHandler();
                this.paginatedTable.destroy();
                delete this.paginatedTable;
            }
        },

        /* constructor method - exposed for unit test */
        initOptions: function (options) {

            this.options = (options) ? options : {};

            this.columns = this.options.columns;
            this.header = this.options.header;

            this.url = this.options.url;
            this.urlQueryParams = this.options.urlQueryParams;
            this.getAllIdsURL = this.options.getAllIdsURL;

            this.expandableContent = this.options.expandableContent;

            this.onErrorHandler = this.options.onErrorHandler;
            this.paginatedLayoutRowSelectionHandlerFunction = this.options.paginatedLayoutRowSelectionHandler;
            this.showEmptyGridMessage = this.options.showEmptyGridMessage;  // replace client SDK empty handling with our handling
            this.getCurrentContextActions = this.options.getCurrentContextActions;
            this.fixedHeight = this.options.fixedHeight;
            this.FilterForm = this.options.filterFormClass;


            // some config options -  default true (until server ready for example)
            this.showCheckBoxes = Utils.isDefined(this.options.showCheckBoxes) ? this.options.showCheckBoxes : true;
            this.showSortingOptions = Utils.isDefined(this.options.showSortingOptions) ? this.options.showSortingOptions : true;
            this.showFilteringOptions = Utils.isDefined(this.options.showFilteringOptions) ? this.options.showFilteringOptions : true;
        },


        /**
         * Create Paginated Table
         *
         * Need to define a getTableSettingsForms method because the default that would be displayed if did not provide this method
         * would contain pins (showPins true), which do not work with an expandable row table
         *
         * @returns {tablelib.layouts.PaginatedTable}
         */
        createPaginatedLayoutTable: function () {

            var paginatedLayoutOptions = {
                columns: this.columns,
                header: this.header,
                fetch: this.fetchPaginatedData.bind(this),
                getAllIds: this.getAllIds.bind(this),
                getTableFilterForm: getTableFilterForm.bind(this),   // compulsory
                getTableSettingsForms: getTableSettingsForms.bind(this, Utils.isDefined(this.expandableContent)),  // included to remove pins
                getPlugins: getPlugins.bind(this)

            };
            return new PaginatedTable(paginatedLayoutOptions);

        },

        /**
         * Wrap client SDK refresh method
         * This method should be called when the data has changed.
         * It will refresh the data displayed on the current page and clear any items currently selected.
         */
        refresh: function () {
            this.paginatedTable.refresh();
        },

        /**
         * Utility to get total row count - all grids
         * SDK hack using unpublished method #getDataInfoById
         */
        getGridRowCount: function () {
            var dataInfoIds = this.paginatedTable.getDataInfoById();  // (let tests fail if this function no longer exists)
            return Utils.isDefined(dataInfoIds) ? Object.keys(dataInfoIds).length : 0;  // 0 is bad data
        },

        /**
         * Has user chosen the "Select all xxx on all pages" link
         * @returns {*}  true if all rows on all pages are selected
         */
        isSelectAllChecksOnAllPages: function () {
            return this.isSelectAllCheckActive;
        },

        addEventHandlers: function () {

            if (!Utils.isDefined(this.selectChangeEventHandlerId)) {
                this.selectChangeEventHandlerId = this.paginatedTable.addEventHandler('select:change', rowSelectionChangeHandler.bind(this));
            }

            if (!Utils.isDefined(this.selectPageEventHandlerId)) {
                this.selectPageEventHandlerId = this.paginatedTable.addEventHandler('select:page', function (pageIndex) {
                    this.isSelectAllCheckActive = false;
                }.bind(this));
            }
            if (!Utils.isDefined(this.selectAllRowsEventHandlerId)) {
                this.selectAllRowsEventHandlerId = this.paginatedTable.addEventHandler('select:all', selectAllRowsOnAllPagesHandler.bind(this));
            }

        },


        removeEventHandlers: function () {

            if (Utils.isDefined(this.selectChangeEventHandlerId)) {
                this.paginatedTable.removeEventHandler('select:change', this.selectChangeEventHandlerId);
                delete this.selectChangeEventHandlerId;
            }
            if (Utils.isDefined(this.selectPageEventHandlerId)) {
                this.paginatedTable.removeEventHandler('select:page', this.selectPageEventHandlerId);
                delete this.selectPageEventHandlerId;
            }
            if (Utils.isDefined(this.selectAllRowsEventHandlerId)) {
                this.paginatedTable.removeEventHandler('select:all', this.selectAllRowsEventHandlerId);
                delete this.selectAllRowsEventHandlerId;
            }
            // do not include context menu here as add and remove handlers in #clearAllRowSelectionOnAllPages

        },


        /**
         * Utility to completely hide access to filter component
         *
         * TODO  Warning SDK HACK
         * WARNING: Using non-published SDK methods inside PaginatedTable, #getTableHeader()
         * (Filter is compulsory in API)
         *
         * @param showFilter   true to show filter widget on table header (default), false to hide completely
         */
        showFilterOption: function (showFilter) {
            var tableHeader = this.paginatedTable.getTableHeader();
            var filterButton = tableHeader.getElement().find(Constants.clientSDKClassNames.TABLE_LIB_HEADER_FILTER);
            if (filterButton) {
                Utils.showElementInlineBlock(filterButton, showFilter);
            }
        },


        /**
         * Clear row selection on all pages
         * (this would not be necessary if our server used ids only)
         *
         * TODO  Warning SDK HACK
         * WARNING: Using non-published SDK methods inside PaginatedTable, #onTableSelectionClear
         */
        clearAllRowSelectionOnAllPages: function () {

            this.removeEventHandlers(); // avoid infinite loop

            this.paginatedTable.onTableSelectionClear();
            this.clearSelectedRowsCache();

            this.addEventHandlers();
        },


        /**
         * Add content menu item if not added already
         *
         * Method which can only be called after table is populated
         * (#getTable returns an object)
         *
         * TODO  Warning SDK HACK
         * WARNING: Using non-published SDK methods inside PaginatedTable, #getTable
         */
        addTableContextMenuEventHandlerOnce: function () {

            if (!Utils.isDefined(this.contextMenusEventId)) {

                var underLyingTable = this.paginatedTable.getTable();
                if (underLyingTable) {
                    this.contextMenusEventId = underLyingTable.addEventHandler('rowevents:contextmenu', function (row, contextEvent) {
                        showRightClickOptions(underLyingTable, this.getCurrentContextActions, contextEvent);
                    }.bind(this));
                }
            }

        },

        removeTableContextMenuEventHandler: function () {

            if (this.contextMenusEventId) {
                var underLyingTable = this.paginatedTable.getTable();
                if (underLyingTable) {
                    underLyingTable.removeEventHandler('rowevents:contextmenu', this.contextMenusEventId);
                }
                delete this.contextMenusEventId;
            }
        },


        /**
         * Calls the direct client SDK method
         * @returns {*}
         */
        getSelectedIds: function () {
            if (this.paginatedTable) {
                return this.paginatedTable.getSelectedIds();
            }
            return [];

        },

        /**
         * SDK Paginated grid goes not provide any access to selected row content (only select row ids)
         *
         * @returns {*}    cached row content of selected rows  (from options.model)
         *                 e.g. can call getSelectedRows()[3].profileName;
         */
        getSelectedRows: function () {

            if (!Utils.isDefined(this.selectedRows)) {
                return [];
            }

            if (typeof Object.values === 'function') {    // browser compatibility
                return Object.values(this.selectedRows);

            } else {
                var longHandArray = [];
                for (var idKey in this.selectedRows) {
                    if (this.selectedRows.hasOwnProperty(idKey)) {
                        longHandArray.push(this.selectedRows[idKey]);
                    }
                }
                return longHandArray;
            }
        },

        clearSelectedRowsCache: function () {
            this.selectedRows = {};
        },

        /**
         * The client SDK paginatedTable layout does not have a selected rows method (it has #getSelectedIds).
         * We will only be able to build this up using current table (page) table.
         * So building it up on row selection (can only select on current (page) table.
         *
         * Note can only save row information for pages the user has visited.
         */
        updateSelectedRowsCache: function () {

            var selectedRowsIdsAllPages = this.paginatedTable.getSelectedIds(); // probably strings

            // remove previously selected rows if no longer in full Selected row id list
            for (var idKey in this.selectedRows) {
                if (this.selectedRows.hasOwnProperty(idKey)) {   // id becomes String

                    if (selectedRowsIdsAllPages.indexOf(idKey) === -1) {  // assume all Strings not int and String
                        delete this.selectedRows[idKey];  // no longer selected
                    }
                }
            }

            /* can only get current selected rows data from current page (table) */
            var currentPageSelectedRows = this.paginatedTable.getTable().getSelectedRows();

            for (var i = 0; i < currentPageSelectedRows.length; i++) {
                var selectedRowId = currentPageSelectedRows[i].getData().id;

                if (selectedRowsIdsAllPages.indexOf(selectedRowId) !== -1 || selectedRowsIdsAllPages.indexOf("" + selectedRowId) !== -1) {

                    /* options.model so can call columns directly, eg. selectedConflictsRows[0].options.model.profileName */

                    this.selectedRows[selectedRowId] = currentPageSelectedRows[i].options.model;  // no duplicates
                }
            }

        },

        /**
         * Fetch data for current page displayed (supports sorting and filtering)
         *
         * request : {
         * sortAttr: 'username', // {string} attribute name
         * sortDir: 'asc', // {string} sorting order, 'asc' / 'desc'
         * limit: 50, // {int}    amount of items starting from the offset
         * offset: 0, // {int}    item index from which request starts
         * pageIndex: 1, // {int}    page index, 1 based
         * filters: {} // {object} object describing the filters applied
         *
         * @param request
         */
        fetchPaginatedData: function (request) {

            return new Promise(function (resolve, reject) {

                if (this.pageXhr) {
                    this.pageXhr.abort();
                }

                this.requestParams = this.getParamsFromRequest(request);

                var queryParams = "";
                if (this.urlQueryParams) {
                    for (var key in this.urlQueryParams) {
                        queryParams += "&" + key + "=" + this.urlQueryParams[key];
                    }
                }

                this.pageXhr = ajaxService.getCall({

                    url: this.url + (this.requestParams + queryParams),

                    success: function (response) {

                        resolve.call(this, response);  // client SDK handling populating grid (eventually - no callback on when populated)

                        /* add our own extras outside client sdk */
                        var rowCountCurrentPage = (response.items) ? response.items.length : 0; // might be safer than response.total  (all pages)
                        this.handleOnFetchSuccess(rowCountCurrentPage, requestContainsFilter(this.requestParams));

                    }.bind(this),

                    error: function (message, response) {

                        if (typeof this.onErrorHandler === 'function') {
                            this.onErrorHandler(message, response);
                        } else {
                            reject(message, response);   // client SDK error handling displays (Error - Internal Server Error)

                        }
                    }.bind(this)


                });
            }.bind(this));
        },


        /**
         * Post Client SDK Handling of fetch success.
         * Intercept to change message to suit our grid (server would say "No Data = the request returned no data to display"
         * with table settings and row counter and filter still showing)
         *
         * Note there will be a race condition with client SDK paginated layout widget (#onFetchSuccess - i.e. resolve)
         * so we do not know if grid is actually populated at this point !!!
         *
         * @param rowCount  row count retrieved for current page
         *                  If following page limit change would equals page limit.
         *                  (does not mean rows are not selected on other pages)
         *
         * @param isDataFiltered  The data could be filtered - in which case would not want to over-write any
         *                        empty messages (as will need to keep clear filter options)
         */
        handleOnFetchSuccess: function (rowCount, isDataFiltered) {

            // note has to be called (even if 0) to show call complete
            this.paginatedLayoutRowSelectionHandlerFunction().handleGridPopulation(rowCount);  // rowCount can be 0

            if (rowCount === 0) {
                this.removeTableContextMenuEventHandler();  // remove so will get them back when table is populated again
            }


            if (rowCount === 0 && !isDataFiltered) {
                if (Utils.isDefined(this.showEmptyGridMessage)) {
                    this.showEmptyGridMessage(true);
                }

            } else {
                if (Utils.isDefined(this.showEmptyGridMessage)) {
                    this.showEmptyGridMessage(false);
                }

                /* force change in nav buttons when re-enter grid (e.g. following table sort or page change
                 *  (this.paginatedTable.getSelectedIds() might not be ready)*/

                if (this.showCheckBoxes) {
                    if (this.isSelectAllChecksOnAllPages()) {
                        this.paginatedLayoutRowSelectionHandlerFunction().selectAllOnAllPages();
                    } else {
                        var numSelectedRows = (this.cachedNumPrevSelectedRows) ? this.cachedNumPrevSelectedRows : 0;
                        this.paginatedLayoutRowSelectionHandlerFunction().selectChange(numSelectedRows);
                    }
                }

            }
        },

        /**
         * Parameters for server request supporting sorting and filtering
         *
         * @param  request :
         *  sortAttr: {string} attribute name, e.g. 'profileName'
         *  sortDir: "asc" or "desc"
         *  filters:{"profileName":"myProfile name"}
         *  pageIndex: {int}    page index, 1 based
         *  offset:  item index from which request starts
         *  limit:   amount of items starting from the offset
         *  networkTechnology:LTE
         */
        getParamsFromRequest: function (request) {

            var returnParams = "?offset=" + request.offset + "&limit=" + request.limit;

            if (this.showSortingOptions) {
                var sortAttr = Utils.isDefined(request.sortAttr) ? request.sortAttr : this.DEFAULT_SORT_COLUMN;
                var sortDir = Utils.isDefined(request.sortDir) ? request.sortDir : this.DEFAULT_SORT_DIR;
                returnParams = returnParams + "&sortAttr=" + sortAttr + "&sortDir=" + sortDir;
            }

            if (this.showFilteringOptions) {
                var filters = JSON.stringify((Utils.isDefined(request.filters)) ? request.filters : {});
                returnParams = returnParams + "&filters=" + filters;
            }

            // not interested in "&pageIndex=" + request.pageIndex + )
            return returnParams;
        },


        /**
         * Method required to be present for paginated layout grid to work
         * @returns {Promise}
         */
        getAllIds: function () {

            return new Promise(function (resolve, reject) {
                ajaxService.getCall({
                    url: this.getAllIdsURL,
                    success: function (response) {

                        /* assumes server passing an array of Ids directly - we do not have to intercept and can pass straight to SDK */
                        return resolve(response);  // assumes server passing an array of Ids directly
                    }.bind(this),


                    error: function (message, response) {

                        if (typeof this.onErrorHandler === 'function') {
                            this.onErrorHandler(message, response);
                        } else {
                            reject(message, response);   // client SDK error handling displays (Error - Internal Server Error)

                        }
                    }.bind(this)

                });

            }.bind(this));

        },

        /**
         * Disable all options for paginated grid
         * (support for backward wizard handling)
         *
         * Not implementing enabling back as assume new grid is being created when enable
         *
         * Client SDK is not giving notification as to when grid is populated.
         * But we are calling this method after the results are received for the page
         * (so we know it will be populated pretty soon)
         *
         * When the grid does not have checkboxes there is not point in disabling
         * filtering or table settings (we disable filtering and table settings because these can
         * be a way to change the selection)
         *
         * Adding a delay so that we are checking inputs on the replaced grid rather
         * than the current grid (when user changes page, limits, etc)
         *
         */
        disableOrHideGridOptions: function () {


            this.showLoader();

            setTimeout(function () {

                this.disableOrHideGridOptionsOutSideTimer();

            }.bind(this), GeneralPaginatedLayoutTable.MS_TO_LOAD_GRID_WHEN_HAVE_RESULTS);  // grid data for page (available from server) should be rendered on page by this time


        },

        /**
         * Can call this when know the grid is populated on screen
         */
        disableOrHideGridOptionsOutSideTimer: function () {
            if (Utils.isDefined(this.paginatedTable)) {


                this.disableOrHideSelectedText();


                if (this.showCheckBoxes) {

                    this.paginatedTable.disableFilterButton();
                    this.paginatedTable.disableSettingsButton();  // disabling because when you use it you can clear selection (SDK clears selection when use TableSettings)


                    //var inputsOnPage = this.getElement().findAll("input");
                    var inputsOnPage = this.paginatedTable.getElement().findAll("input");

                    var count = inputsOnPage.length;

                    /* disable all checkboxes on all rows in grid */
                    for (var i = count - 1; i >= 0; i--) {
                        inputsOnPage[i].setProperty("disabled", true);
                    }
                }

                this.hideLoader();

            }
        },


        isGridDisabled: function () {

            var inputsOnPage = this.paginatedTable.getElement().findAll("input");
            if (inputsOnPage) {
                var count = inputsOnPage.length;

                /* disable all checkboxes on all rows in grid */
                for (var i = count - 1; i >= 0; i--) {
                    return inputsOnPage[i].getProperty("disabled"); // exit if one disabled

                }
            }
            return false;
        },


        /**
         * There is still some rogue listeners in SDK header which allows clicking
         * to change display and show Clear again when click on row (i.e. even when
         * the row is disabled).
         *
         * Replacing "Selected (4) - Clear"  with our version (Selected (4)) - which we do not want SDK to change
         *
         * For the case where not showing checkboxes hiding "Selected (0)" entirely.
         * (method can be called externally - but must be done via the timer, i.e. after grid is displayed
         * #disableGridOptionsConsideringIfCheckboxes)
         *
         */
        disableOrHideSelectedText: function () {
            var tableHeader = this.paginatedTable.getTableHeader();
            var selectedInfoHolder = this.getSelectedInfoHolder(tableHeader);
            if (Utils.isDefined(selectedInfoHolder)) {

                var htmlNode = selectedInfoHolder.getNative();

                if (htmlNode.firstChild) {

                    if (!Utils.isDefined(this.textNotToChangeWhileDisabled)) {

                        var selectedText = htmlNode.firstChild.nodeValue; // e.g. "Selected (3) -"  (- present when Clear options)

                        var endIndex = (selectedText !== null ) ? selectedText.lastIndexOf("-") : -1;
                        var newText;
                        if (this.showCheckBoxes) {
                            if (endIndex !== -1) {
                                newText = selectedText.substring(0, endIndex); // e.g.  "Selected (3)"

                            } else {
                                newText = selectedText;
                            }
                        } else {
                            newText = '';  // // "Selected" remains hidden if not showing checkboxes
                        }
                        this.textNotToChangeWhileDisabled = newText;
                    }

                    while (htmlNode.firstChild) {
                        htmlNode.removeChild(htmlNode.firstChild);   // remove Selected ("Clear", etc. if there)
                    }


                    // when change page, select row, SDK will change back to add Clear, etc and change selected count (we are undoing this)
                    var staticTextDiv = document.createElement('div');
                    staticTextDiv.textContent = this.textNotToChangeWhileDisabled;    // our text div with no clear option

                    htmlNode.appendChild(staticTextDiv);


                }
            }

        },

        /* expose for junit */
        getSelectedInfoHolder: function (tableHeader) {
            return tableHeader.getElement().find(Constants.clientSDKClassNames.TABLE_LIB_HEADER_SELECTED);
        },


        showLoader: function () {
            if (!Utils.isDefined(this.extraLoader)) {

                this.extraLoader = new Loader();

                /* this moves a  bit from ( this.paginatedTable.view.getBody()), but is necessary to
                 not allow pressing the clear option visible for disabled grid momentarily (with incorrect selected count)
                 when changing pages */

                this.extraLoader.attachTo(this.getElement());
            }
        },


        hideLoader: function () {
            if (Utils.isDefined(this.extraLoader)) {
                this.extraLoader.destroy();
                delete this.extraLoader;
            }

        }

    }, {

        /**
         * Estimate in milli-secs of how long it would take to render the grid rows onto page
         * (the results have returned from server at this point)
         * as we need to ensure we are disabling checkboxes on the new grid (not the old pages ones)
         */
        MS_TO_LOAD_GRID_WHEN_HAVE_RESULTS: 2000


    });


    function requestContainsFilter(requestParameters) {

        var filterParams = Utils.getItemValueFromQueryParams(requestParameters, "filters");
        // shorter than Object.keys(JSON.parse(filterParams)).length === 0
        return filterParams !== "{}";
    }


    /**
     * Handle event triggered for when the selection on the table changed
     */
    function rowSelectionChangeHandler() {

        if (!this.isGridDisabled()) {

            delete this.textNotToChangeWhileDisabled;

            this.addTableContextMenuEventHandlerOnce();  // we know the table is now populated if can click on an item

            if (this.isSelectAllCheckActive === true) {

                /* Because unfortunately our server does not just need cached ids for use cases such as Missing Data Report, etc.,
                 we need to have actually visited the page  (have information in this.selectedRows).
                 We can not use default SDK behavior that when say un-select one row after using "the select all on all pages" - all others
                 are still selected) -  so we need to clear selection on all page - if un-selects one   (the only other solution is
                 for server side to accept "id" instead for use cases) */

                this.clearAllRowSelectionOnAllPages();     // user will have to select again

            }

            this.isSelectAllCheckActive = false;

            this.updateSelectedRowsCache();

            var selectedRowCount = this.paginatedTable.getSelectedIds().length;

            this.paginatedLayoutRowSelectionHandlerFunction().selectChange(selectedRowCount, this.cachedNumPrevSelectedRows);

            this.cachedNumPrevSelectedRows = selectedRowCount;

        } else {

            /* here to undo rogue event listener in client SDK paginated widget which can change the Selected Item number
             when click on the disabled row
             */
            this.disableOrHideSelectedText();

        }

    }

    /**
     * Handle event triggered when the all pages are selected
     * (pressed "select all xxx on all pages" link)
     */
    function selectAllRowsOnAllPagesHandler() {

        this.isSelectAllCheckActive = true;

        /* we do not pass any row information to server when select all pages */
        this.clearSelectedRowsCache();
        this.paginatedLayoutRowSelectionHandlerFunction().selectAllOnAllPages();

    }

    /**
     * Adding context menu to underlying table
     *
     * @param table           this.paginatedTable.getTable() which must exist
     * @param contextMenuAction  supplied menu items - function or array supported
     * @param contextEvent       passed from "rowevents:contextmenu" event
     */
    function showRightClickOptions(table, contextMenuAction, contextEvent) {

        var selectedRows = table.getSelectedRows();

        if (selectedRows.length > 0) {
            var contextMenuActions;

            if (typeof contextMenuAction === 'function') {  // a function based on row selection
                contextMenuActions = contextMenuAction();
            } else {
                contextMenuActions = [contextMenuAction];
            }

            container.getEventBus().publish("contextmenu:show", contextEvent, contextMenuActions);
        } else {
            container.getEventBus().publish("contextmenu:hide");
        }
    }


    /**
     * Implementing the optional method such that we do not display the "pins" on the Table Settings widget flyout
     * This is because if the  grid has expandable rows and client SDK pins do not work when expandable row is present
     * @returns {Array}
     */
    function getTableSettingsForms(tableHasExpandableRows) {

        return [
            {
                /* UX do not want to see "Columns" on header, i.e. not using header parameter */
                content: new TableSettings({ // TableSettings implements getUpdatedColumns
                    selectDeselectAll: {
                        labels: {
                            select: Dictionary.TABLE_SETTINGS_SELECT_LABEL,
                            all: Dictionary.TABLE_SETTINGS_ALL,
                            none: Dictionary.TABLE_SETTINGS_NONE
                        }
                    },
                    columns: this.columns,
                    showPins: (!tableHasExpandableRows)   // whole reason for having this method at all (rather than take default)
                })
            }
        ];
    }

    /**
     * Create Filter form   (mandatory method for paginated table)
     * @param filters                Pass the existing filters to restore the form with the last filters applied
     * @returns {this.FilterForm}    filter type is suitable for grid
     */
    function getTableFilterForm(filters) {

        return new this.FilterForm({
                data: filters
            }
        );
    }


    /**
     * Set list of plugins currently support in
     * this paginated grids
     *
     * @returns {Array}
     */
    function getPlugins() {

        // expandable icon has to be first column (0 index)

        var plugins = [];

        if (Utils.isDefined(this.expandableContent)) {
            plugins.push(
                new ExpandableRows({
                    content: this.expandableContent
                })
            );
        }

        if (this.showSortingOptions) {
            plugins.push(new SortableHeader());
        }

        if (this.showCheckBoxes) {
            plugins.push(
                new Selection({
                    checkboxes: true,
                    selectableRows: true,
                    multiselect: true,
                    bind: true
                })
            );
        }


        // can not mix Fix Header and StickyHeader (use one or the other)
        if (Utils.isDefined(this.fixedHeight)) {
            plugins.push(
                new FixedHeader({maxHeight: this.fixedHeight})
            );
        } else {
            plugins.push(
                new StickyHeader({
                    topOffset: 33
                }),
                new StickyScrollbar()
            );
        }

        plugins.push(
            new ResizableHeader(),   //   note that columns must specify an initial "width"
            new SmartTooltips(),

            new RowEvents({
                events: ['contextmenu']
            }));

        return plugins;
    }

    return GeneralPaginatedLayoutTable;
});

