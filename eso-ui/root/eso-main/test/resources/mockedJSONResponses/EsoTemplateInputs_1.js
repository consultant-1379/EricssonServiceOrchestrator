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
 * Date: 25/01/18
 */

if (typeof define !== 'function') {
    var define = require('../../../../node_modules/amdefine')(module);
}


define(function () {

        /**
         * simulated response from   /service-models/:serviceTemplate_Id/inputs
         */
        return  [
            {
                name: "ApnName",
                default: "apn.operator.com",
                description: "Access Point Name (APN) for GGSN/PDN Gateway ",
                type: "string"
            },
            {
                name: "ChargingEnabled",
                default: false,
                description: "Charging ",
                type: "boolean"
            },
            {
                name: "DC_Location",
                default: [
                    "Athlone",
                    "Gothenburg"
                ],
                description: "Location of virtual Data Centre (vDC) ",
                type: "string"
            },
            {
                name: "GiAddressRange",
                default: "10.10.1.0/29",
                description: "DHCP Pool independent Gi Address (GGSN-to-PDN) ",
                type: "string"
            },
            {
                name: "GiVpnId",
                default: 22,
                description: "Gi (GGSN-to-PDN) VPN ID ",
                type: "integer"
            },
            {
                name: "ImsiNumberSeries",
                default: "272-01",
                description: "International Mobile Subscriber Identity ",
                type: "string"
            },
            {
                name: "RoamingEnabled",
                default: false,
                description: "Roaming ",
                type: "boolean"
            },
            {
                name: "VNFM_Host",
                default: "http://141.137.212.33:8081",
                description: "VNFManager Host IP, http://<IPv4 address>:<Port> ",
                type: "string"
            },
            {
                name: "vEPG_VIM",
                default: "CEE",
                description: "Vimzone for vMME Node in the slice ",
                type: "string"
            },
            {
                name: "vMME_VIM",
                default: "CEE",
                description: "Vimzone for vMME Node in the slice ",
                type: "string"
            },
            {
                name: "vPCRF_VIM",
                default: "myVzId",
                description: "Vimzone for vMME Node in the slice ",
                type: "string"
            }
        ]
    }
);
