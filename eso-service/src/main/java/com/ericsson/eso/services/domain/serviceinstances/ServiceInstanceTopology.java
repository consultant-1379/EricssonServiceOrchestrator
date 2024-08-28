package com.ericsson.eso.services.domain.serviceinstances;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ericsson.eso.services.domain.common.Input;
import com.ericsson.eso.services.domain.common.Node;
import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

public class ServiceInstanceTopology {

	@JsonProperty("inputs")
	private List<Input> inputs = null;
	@JsonProperty("nodes")
	private List<Node> nodes = null;
	@JsonProperty("outputs")
	private List<Object> outputs = null;
	@JsonIgnore
	private Map<String, Object> additionalProperties = new HashMap<>();

	@JsonProperty("inputs")
	public List<Input> getInputs() {
		return inputs;
	}

	@JsonProperty("inputs")
	public void setInputs(List<Input> inputs) {
		this.inputs = inputs;
	}

	@JsonProperty("nodes")
	public List<Node> getNodes() {
		return nodes;
	}

	@JsonProperty("nodes")
	public void setNodes(List<Node> nodes) {
		this.nodes = nodes;
	}

	@JsonProperty("outputs")
	public List<Object> getOutputs() {
		return outputs;
	}

	@JsonProperty("outputs")
	public void setOutputs(List<Object> outputs) {
		this.outputs = outputs;
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