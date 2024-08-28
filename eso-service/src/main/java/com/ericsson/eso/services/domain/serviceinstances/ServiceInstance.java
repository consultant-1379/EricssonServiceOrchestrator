package com.ericsson.eso.services.domain.serviceinstances;

import java.util.HashMap;
import java.util.Map;

import com.ericsson.eso.services.domain.serviceexecutions.ServiceExecution;
import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ServiceInstance {
	
	@JsonProperty("id")
	private String id;
	@JsonProperty("creTime")
	private String creTime;
	@JsonProperty("name")
	private String name;
	@JsonProperty("serviceModelID")
	private String serviceModelID;
	
	//TODO - add service model name and other data
	private String serviceModelName;

	
	@JsonIgnore
	private Map inputs;
	@JsonIgnore
	private ServiceExecution lastServiceExecution;
	
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
	
	@JsonProperty("serviceModelID")
	public String getServiceModelID() {
		return serviceModelID;
	}
	
	public void setServiceModelID(String serviceModelID) {
		this.serviceModelID = serviceModelID;
	}
	
	public Map getInputs() {
		return inputs;
	}

	public void setInputs(Map inputs) {
		this.inputs = inputs;
	}

	public ServiceExecution getLastServiceExecution() {
		return lastServiceExecution;
	}

	public void setLastServiceExecution(ServiceExecution lastServiceExecution) {
		this.lastServiceExecution = lastServiceExecution;
	}
	
	public String getServiceModelName() {
		return serviceModelName;
	}

	public void setServiceModelName(String serviceModelName) {
		this.serviceModelName = serviceModelName;
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
		strBuilder.append(", serviceModelID").append(":").append(serviceModelID);
		strBuilder.append(", inputs").append(":").append(inputs);
		strBuilder.append(", lastServiceExecution").append(":").append(lastServiceExecution);
		strBuilder.append(", serviceModelName").append(":").append(serviceModelName);
		strBuilder.append(", additionalProperties").append(":").append(additionalProperties);

		return strBuilder.toString();
	}

}
