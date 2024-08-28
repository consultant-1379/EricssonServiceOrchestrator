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
@JsonPropertyOrder({ "requirement", "nodetype", "name", "capabilities", "nodeattributes", "nodeproperties",
		"description" })
public class NodeTemplate {

	@JsonProperty("requirement")
	private List<Object> requirement = null;
	@JsonProperty("nodetype")
	private String nodetype;
	@JsonProperty("name")
	private String name;
	@JsonProperty("capabilities")
	private List<Capability> capabilities = null;
	@JsonProperty("nodeattributes")
	private List<Nodeattribute> nodeattributes = null;
	@JsonProperty("nodeproperties")
	private List<Nodeproperty> nodeproperties = null;
	@JsonProperty("description")
	private Object description;
	@JsonIgnore
	private Map<String, Object> additionalProperties = new HashMap<String, Object>();

	@JsonProperty("requirement")
	public List<Object> getRequirement() {
		return requirement;
	}

	@JsonProperty("requirement")
	public void setRequirement(List<Object> requirement) {
		this.requirement = requirement;
	}

	@JsonProperty("nodetype")
	public String getNodetype() {
		return nodetype;
	}

	@JsonProperty("nodetype")
	public void setNodetype(String nodetype) {
		this.nodetype = nodetype;
	}

	@JsonProperty("name")
	public String getName() {
		return name;
	}

	@JsonProperty("name")
	public void setName(String name) {
		this.name = name;
	}

	@JsonProperty("capabilities")
	public List<Capability> getCapabilities() {
		return capabilities;
	}

	@JsonProperty("capabilities")
	public void setCapabilities(List<Capability> capabilities) {
		this.capabilities = capabilities;
	}

	@JsonProperty("nodeattributes")
	public List<Nodeattribute> getNodeattributes() {
		return nodeattributes;
	}

	@JsonProperty("nodeattributes")
	public void setNodeattributes(List<Nodeattribute> nodeattributes) {
		this.nodeattributes = nodeattributes;
	}

	@JsonProperty("nodeproperties")
	public List<Nodeproperty> getNodeproperties() {
		return nodeproperties;
	}

	@JsonProperty("nodeproperties")
	public void setNodeproperties(List<Nodeproperty> nodeproperties) {
		this.nodeproperties = nodeproperties;
	}

	@JsonProperty("description")
	public Object getDescription() {
		return description;
	}

	@JsonProperty("description")
	public void setDescription(Object description) {
		this.description = description;
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