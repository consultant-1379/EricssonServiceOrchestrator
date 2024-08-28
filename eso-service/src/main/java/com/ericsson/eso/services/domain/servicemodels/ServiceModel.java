package com.ericsson.eso.services.domain.servicemodels;

import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ServiceModel {
	
	@JsonProperty("id")
	private String id;
	@JsonProperty("creTime")
	private String creTime;
	@JsonProperty("name")
	private String name;
	@JsonProperty("description")
	private String description;
	@JsonProperty("mainSTFile")
	private String mainSTFile;	

	@JsonIgnore
	private Map<String, Object> additionalProperties = new HashMap<String, Object>();
	
	@JsonProperty("id")
	public String getId() {
		return id;
	}
	
	public void setId(String id) {
		this.id = id;
	}
	
	@JsonProperty("creTime")
	public String getCreTime() {
		return creTime;
	}
	
	public void setCreTime(String creTime) {
		this.creTime = creTime;
	}
	
	@JsonProperty("name")
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	@JsonProperty("description")
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	@JsonProperty("mainSTFile")
	public String getMainSTFile() {
		return mainSTFile;
	}

	public void setMainSTFile(String mainSTFile) {
		this.mainSTFile = mainSTFile;
	}

	@JsonAnyGetter
	public Map<String, Object> getAdditionalProperties() {
		return this.additionalProperties;
	}

	@JsonAnySetter
	public void setAdditionalProperty(String name, Object value) {
		this.additionalProperties.put(name, value);
	}
	
	@Override
	public String toString() {
		StringBuilder strBuilder = new StringBuilder();
		strBuilder.append("id").append(":").append(id);
		strBuilder.append(", name").append(":").append(name);
		strBuilder.append(", creTime").append(":").append(creTime);
		strBuilder.append(", description").append(":").append(description);
		strBuilder.append(", mainSTFile").append(":").append(mainSTFile);
		strBuilder.append(", additionalProperties").append(":").append(additionalProperties);

		return strBuilder.toString();
	}


}
