package com.ericsson.eso.services.domain.servicemodels;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ericsson.eso.services.domain.common.Input;
import com.ericsson.eso.services.domain.common.NodeTemplate;
import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({ "inputs", "node_templates" })
public class ServiceModelTopology {

	@JsonProperty("inputs")
	private List<Input> inputs = null;
	@JsonProperty("node_templates")
	private List<NodeTemplate> nodeTemplates = null;
	@JsonIgnore
	private Map<String, Object> additionalProperties = new HashMap<String, Object>();

	@JsonProperty("inputs")
	public List<Input> getInputs() {
		return inputs;
	}

	@JsonProperty("inputs")
	public void setInputs(List<Input> inputs) {
		this.inputs = inputs;
	}

	@JsonProperty("node_templates")
	public List<NodeTemplate> getNodeTemplates() {
		return nodeTemplates;
	}

	@JsonProperty("node_templates")
	public void setNodeTemplates(List<NodeTemplate> nodeTemplates) {
		this.nodeTemplates = nodeTemplates;
	}

	@JsonAnyGetter
	public Map<String, Object> getAdditionalProperties() {
		return this.additionalProperties;
	}

	@JsonAnySetter
	public void setAdditionalProperty(String name, Object value) {
		this.additionalProperties.put(name, value);
	}

}