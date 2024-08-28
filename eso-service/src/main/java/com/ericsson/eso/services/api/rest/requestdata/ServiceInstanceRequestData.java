package com.ericsson.eso.services.api.rest.requestdata;

import java.util.HashMap;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({ "name", "serviceModelID", "inputs" })
public class ServiceInstanceRequestData {

	@JsonProperty("name")
	private String name;
	@JsonProperty("serviceModelID")
	private String serviceModelID;
	@JsonProperty("inputs")
	private Map<String, String> inputs;
	@JsonIgnore
	private Map<String, Object> additionalProperties = new HashMap<>();

	@JsonProperty("name")
	public String getName() {
		return name;
	}

	@JsonProperty("name")
	public void setName(String name) {
		this.name = name;
	}

	@JsonProperty("serviceModelID")
	public String getServiceModelID() {
		return serviceModelID;
	}

	@JsonProperty("serviceModelID")
	public void setServiceModelID(String serviceModelID) {
		this.serviceModelID = serviceModelID;
	}

	@JsonProperty("inputs")
	public Map<String, String> getInputs() {
		return inputs;
	}

	@JsonProperty("inputs")
	public void setInputs(Map<String, String> inputs) {
		this.inputs = inputs;
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
		strBuilder.append(", serviceModelID").append(":").append(serviceModelID);
		strBuilder.append(", inputs").append(":").append(inputs);		
		strBuilder.append(", additionalProperties").append(":").append(additionalProperties);

		return strBuilder.toString();
	}

}