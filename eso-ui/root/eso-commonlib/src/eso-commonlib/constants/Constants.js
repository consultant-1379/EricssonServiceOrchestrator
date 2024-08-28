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
 * Date: 24/11/17
 */
define({

    /**
     * Define some constants, but note that anything that is shown to the customer will have to be
     * inside the localisation json (dictionary.json) for Dictionary lookup using the i18n plugin !!!
     */

    /**
     * info popup width that will suit all media (phone)
     */
    DEFAULT_INFO_POPUP_WIDTH: '300px',

    DEFAULT_DIALOG_WIDTH: '300px',
    /**
     * Any number of columns less than or equal to this will have 'zebra' - stripped rows
     */
    TABLE_COLUMN_COUNT_CUT_OFF_FOR_STRIPED_ROWS: 4,

    NETWORK_SLIDE_SUBTLE_BUTTON_NAME_FOR_DIV: "NetworkSliceButton",  // SDK will use - (no spaces in name important)

    /**
     * Configure showing "Start WorkFlow" options on Network Slice (creation and from context menu)
     * In current Production release this will remain FALSE
     */
    SHOW_START_WORKFLOW: false,

    /**
     * TEMP flag to allow commit to master when server not ready to
     * display Execution Plans and Models (Node Graph)
     */
    SHOW_NODE_GRAPHS: false,

    /**
     * hash for location changes (and toasts)
     */
    lcHash: {
        HASH: '#',
        APP_HOME_PAGE: '#eso-ui',
        APP_HOME_PAGE_CREATE_SLICE_SUCCESS: '#eso-ui/createSuccess',
        APP_HOME_PAGE_DELETE_SLICE_SUCCESS: '#eso-ui/deleteSuccess',
        APP_HOME_PAGE_START_WORK_FLOW_SUCCESS: '#eso-ui/startWorkFlowSuccess',
        SERVICE_TEMPLATE_APP: "#eso-service-templates",
        CREATE_SLICE_APP: "#eso-create-slice"
    },

    hashQueryParams: {
        NET_SLICE_NAME_EQUALS: 'networkSliceName=',
        NET_SLICE_NAME: 'networkSliceName',
        SERVICE_TEMPLATE_ID_EQUALS: 'serviceTemplateId=',
        SERVICE_TEMPLATE_ID: 'serviceTemplateId'
    },


    polling: {
        NETWORK_SLICE_LIST_POLLING_INTERVAL_MS: 30 * 1000

    },

    executionStates: {
        IN_PROGRESS_EXECUTION_STATE: 0,
        SUCCESS_EXECUTION_STATE: 1,
        FAILED_EXECUTION_STATE: 2
    },


    /**
     * This tag is for any references to the on-line help pages
     * being made on the UI
     */
    helpInfo: {

    },

    /**
     * Constants which are passed from server,
     * agreed between server and client
     * (locale on these applied later but can trust this is what server passes)
     */
    serverConstants: {

        KEY_IN_EXCEPTION_USED_FOR_CUSTOMER_MESSAGES: "internalErrorCode"  // might change to say 'userMessage' if server passed dictionary keys in that

    },

    /**
     * colors from Branding Asset lib
     */
    colors: {

        RED: '#e32119',
        GREEN: '#89ba17',
        GRAY: '#999999',
        ORANGE: '#f08a00',
        WHITE: '#fffff'

    },


    /* for minimising hack impacts */
    clientSDKClassNames: {
        DIALOG_SECONDARY_TEXT: '.ebDialogBox-secondaryText',
        TABLE_LIB_HEADER_FILTER: '.elTablelib-lTableHeader-filter'

//        QUICK_ACTION_BAR_RIGHT: '.elLayouts-QuickActionBar-right',
//        CHECK_BOX_CLASS_NAME: '.ebCheckbox',
//        TABLE_LIB_HEADER_SELECTED: '.elTablelib-lTableInfo-selected',
//        NOTIFICATION_CONTENT: '.ebNotification-content',


    },


    sessionStorage: {
        SERVER_TIME_ZONE_ABBREVIATION: "eso.serverTimeZone",
        UTC_OFF_SET_HOURS: "eso.utcOffsetInHours",
        SERVER_LOCATION: "eso.serverLocation"
    },

    events: {
        "SERVICE_TEMPLATE_SELECTED": "eso:selectedTemplate",
        "WORK_FLOW_SELECTED": "eso:selectedWorkFlow",
        "WORK_FLOWS_AVAILABLE": "eso:workFlowsAvailable",
        "LOADING_EVENT": "eso:loading",

        "NETWORK_SLICE_LIST_UPDATED": "eso:updatedNESliceList",
        "NETWORK_SLICE_SELECTED_OR_DESELECTED": "eso:selectUnSelectNESlice"
    }

});