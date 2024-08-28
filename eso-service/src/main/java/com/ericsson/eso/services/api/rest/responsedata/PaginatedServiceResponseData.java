package com.ericsson.eso.services.api.rest.responsedata;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PaginatedServiceResponseData {

    private int total;
    private List<ServiceModelResponseData> items;

    public int getTotal() {
        return total;
    }

    public void setTotal(final int total) {
        this.total = total;
    }

    public List<ServiceModelResponseData> getItems() {
        return items;
    }

    public void setItems(final List<ServiceModelResponseData> items) {
        this.items = items;
    }

    @Override
    public String toString() {
        return "PaginatedServiceModelResponseData [total=" + total + ", items=" + items + "]";
    }

}
