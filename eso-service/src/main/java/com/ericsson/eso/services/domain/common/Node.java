package com.ericsson.eso.services.domain.common;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({ "nodeattributes", "state", "name", "relationship", "nodeproperties" })
public class Node {

	@JsonProperty("nodeattributes")
	private List<Nodeattribute> nodeattributes = null;
	@JsonProperty("state")
	private String state;
	@JsonProperty("name")
	private String name;
	@JsonProperty("relationship")
	private List<Object> relationship = null;
	@JsonProperty("nodeproperties")
	private List<Nodeproperty> nodeproperties = null;
	@JsonIgnore
	private Map<String, Object> additionalProperties = new HashMap<String, Object>();

	@JsonProperty("nodeattributes")
	public List<Nodeattribute> getNodeattributes() {
		return nodeattributes;
	}

	@JsonProperty("nodeattributes")
	public void setNodeattributes(List<Nodeattribute> nodeattributes) {
		this.nodeattributes = nodeattributes;
	}

	@JsonProperty("state")
	public String getState() {
		return state;
	}

	@JsonProperty("state")
	public void setState(String state) {
		this.state = state;
	}

	@JsonProperty("name")
	public String getName() {
		return name;
	}

	@JsonProperty("name")
	public void setName(String name) {
		this.name = name;
	}

	@JsonProperty("relationship")
	public List<Object> getRelationship() {
		return relationship;
	}

	@JsonProperty("relationship")
	public void setRelationship(List<Object> relationship) {
		this.relationship = relationship;
	}

	@JsonProperty("nodeproperties")
	public List<Nodeproperty> getNodeproperties() {
		return nodeproperties;
	}

	@JsonProperty("nodeproperties")
	public void setNodeproperties(List<Nodeproperty> nodeproperties) {
		this.nodeproperties = nodeproperties;
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