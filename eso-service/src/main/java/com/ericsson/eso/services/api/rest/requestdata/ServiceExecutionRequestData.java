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
public class ServiceExecutionRequestData {

	@JsonProperty("workflow")
	private String workflow;
	@JsonProperty("serviceInstanceId")
	private String serviceInstanceId;
	@JsonProperty("inputs")
	private Map<String, String> inputs;
	@JsonIgnore
	private Map<String, Object> additionalProperties = new HashMap<>();

	@JsonProperty("workflow")
	public String getWorkflow() {
		return workflow;
	}

	@JsonProperty("workflow")
	public void setWorkflow(String workflow) {
		this.workflow = workflow;
	}

	@JsonProperty("serviceInstanceId")
	public String getServiceInstanceId() {
		return serviceInstanceId;
	}

	@JsonProperty("serviceInstanceId")
	public void setServiceInstanceId(String serviceInstanceId) {
		this.serviceInstanceId = serviceInstanceId;
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
		strBuilder.append("[workflow").append(":").append(workflow);
		strBuilder.append(", serviceInstanceId").append(":").append(serviceInstanceId);
		strBuilder.append(", inputs").append(":").append(inputs);		
		strBuilder.append(", additionalProperties").append(":").append(additionalProperties).append("]");

		return strBuilder.toString();
	}

}