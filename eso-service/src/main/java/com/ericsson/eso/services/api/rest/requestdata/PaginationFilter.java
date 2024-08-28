/*------------------------------------------------------------------------------
 *******************************************************************************
 * COPYRIGHT Ericsson 2018
 *
 * The copyright to the computer program(s) herein is the property of
 * Ericsson Inc. The programs may be used and/or copied only with written
 * permission from Ericsson Inc. or in accordance with the terms and
 * conditions stipulated in the agreement/contract under which the
 * program(s) have been supplied.
 *******************************************************************************
 *----------------------------------------------------------------------------*/

package com.ericsson.eso.services.api.rest.requestdata;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * THis class is used as a DTO for filter information.
 * 
 * @author ekeejos
 *
 */
public class PaginationFilter {

    private Map<String, String> filters = new HashMap<String, String>();

    public PaginationFilter(final String filter) {
        try {
            this.filters = new ObjectMapper().readValue(filter, new TypeReference<Map<String, String>>() {
            });
        } catch (final IOException e) {
            e.printStackTrace();
        }
    }

    public String getValue(final String property) {
        return filters.get(property);
    }

    public Map<String, String> getFilters() {
        return filters;
    }

    public boolean hasUnknowProperties() {
        return !filters.isEmpty();
    }

    public boolean isNull() {
        return filters.isEmpty();
    }

    @Override
    public String toString() {
        return "PaginationFilter [filters=" + filters + "]";
    }

}
