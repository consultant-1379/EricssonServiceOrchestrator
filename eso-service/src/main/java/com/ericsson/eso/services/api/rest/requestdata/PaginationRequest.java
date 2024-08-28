package com.ericsson.eso.services.api.rest.requestdata;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Sort;

import com.ericsson.eso.services.api.rest.responsedata.PluginDataList;
import com.ericsson.eso.services.domain.plugins.PluginDetail;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.type.TypeReference;

public class PaginationRequest {
	
	private Integer offset;
	private Integer limit;
	
	private String sortAttr;
	
	private Sort.Direction sortDir;
	
	private Map<String, Object> filter;
	
	public PaginationRequest(Integer offset, Integer limit, String sortAttr, String sortDir, String jsonfilter) throws IllegalArgumentException, JsonParseException, JsonMappingException, IOException {
		this.offset = offset;
		this.limit = limit;
		this.sortAttr = sortAttr;
		this.sortDir = Sort.Direction.fromString(sortDir);
		this.filter = new ObjectMapper().readValue(jsonfilter, new TypeReference<Map<String, String>>(){});
	}
	
	public Integer getOffset() {
		return offset;
	}

	public void setOffset(Integer offset) {
		this.offset = offset;
	}

	public Integer getLimit() {
		return limit;
	}

	public void setLimit(Integer limit) {
		this.limit = limit;
	}

	public String getSortAttr() {
		return sortAttr;
	}

	public void setSortAttr(String sortAttr) {
		this.sortAttr = sortAttr;
	}

	public Sort.Direction getSortDir() {
		return sortDir;
	}

	public void setSortDir(Sort.Direction sortDir) {
		this.sortDir = sortDir;
	}

	public Map<String, Object> getFilter() {
		return filter;
	}

	public void setFilter(Map<String, Object> filter) {
		this.filter = filter;
	}

	public PluginDataList process(List<PluginDetail> list) {
		PluginDataList processedList = new PluginDataList();
		
//		List<PluginDetail> filteredPlugins = list.stream()
//				//TODO - implement sorting & filtering in PluginDetail
//	            .sorted((l, r) -> l.getPlugin_name().compareTo(r.getPlugin_name()))
//	            .collect(Collectors.toList());

		if(limit > 0 && limit > offset && offset < list.size()) {
			List<PluginDetail> paginatedList = list.subList(offset, limit < list.size()?limit:list.size());
			processedList.setItems(paginatedList);
		} else {
			processedList.setItems(list);
		}
		processedList.setTotal(list.size());
		return processedList;
	}



}
