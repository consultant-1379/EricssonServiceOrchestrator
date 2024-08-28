package com.ericsson.eso.services.api.rest.responsedata;

import java.util.List;

import com.ericsson.eso.services.domain.plugins.PluginDetail;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonPropertyOrder({"items", "total"})
public class PluginDataList {
	
	private List<PluginDetail> items;
	private Integer total;

	public PluginDataList() {
		super();
	}

	public PluginDataList(List<PluginDetail> items, Integer total) {
		super();
		this.items = items;
		this.total = total;
	}

	public List<PluginDetail> getItems() {
		return items;
	}
	
	public void setItems(List<PluginDetail> items) {
		this.items = items;
	}
	
	public Integer getTotal() {
		return total;
	}
	
	public void setTotal(Integer total) {
		this.total = total;
	}
	
	@Override
	public String toString() {
		StringBuilder strBuilder = new StringBuilder();
		strBuilder.append("items").append(":").append(items);
		strBuilder.append(",total").append(":").append(total);
		return strBuilder.toString();
	}
}
