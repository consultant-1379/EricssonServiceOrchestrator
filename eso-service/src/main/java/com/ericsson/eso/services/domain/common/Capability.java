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
@JsonPropertyOrder({ "capabilitytype", "name", "capabilityproperties" })
public class Capability {

	@JsonProperty("capabilitytype")
	private String capabilitytype;
	@JsonProperty("name")
	private String name;
	@JsonProperty("capabilityproperties")
	private List<Object> capabilityproperties = null;
	@JsonIgnore
	private Map<String, Object> additionalProperties = new HashMap<String, Object>();

	@JsonProperty("capabilitytype")
	public String getCapabilitytype() {
		return capabilitytype;
	}

	@JsonProperty("capabilitytype")
	public void setCapabilitytype(String capabilitytype) {
		this.capabilitytype = capabilitytype;
	}

	@JsonProperty("name")
	public String getName() {
		return name;
	}

	@JsonProperty("name")
	public void setName(String name) {
		this.name = name;
	}

	@JsonProperty("capabilityproperties")
	public List<Object> getCapabilityproperties() {
		return capabilityproperties;
	}

	@JsonProperty("capabilityproperties")
	public void setCapabilityproperties(List<Object> capabilityproperties) {
		this.capabilityproperties = capabilityproperties;
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
