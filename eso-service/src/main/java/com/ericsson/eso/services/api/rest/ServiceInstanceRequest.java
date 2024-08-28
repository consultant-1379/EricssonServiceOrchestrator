package com.ericsson.eso.services.api.rest;

import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ServiceInstanceRequest {
	//TODO implement proper JSON annotation when API defined
	@JsonProperty("name")
	private String name;
	@JsonProperty("serviceModelId")
	private String serviceModelId;

	@JsonProperty("inputs")
	private Map<String, String> inputs;
	
	@JsonIgnore
	private Map<String, Object> additionalProperties = new HashMap<String, Object>();
	
	public String getServiceModelId() {
		return serviceModelId;
	}

	public void setServiceModelId(String serviceModelId) {
		this.serviceModelId = serviceModelId;
	}

	public Map<String, String> getInputs() {
		return inputs;
	}
	
	public void setInputs(Map<String, String> inputs) {
		this.inputs = inputs;
	}
	
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
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
		strBuilder.append("name").append(":").append(name);
		strBuilder.append(", serviceModelId").append(":").append(serviceModelId);
		strBuilder.append(", inputs").append(":").append(inputs);		
		strBuilder.append(", additionalProperties").append(":").append(additionalProperties);

		return strBuilder.toString();
	}

}
