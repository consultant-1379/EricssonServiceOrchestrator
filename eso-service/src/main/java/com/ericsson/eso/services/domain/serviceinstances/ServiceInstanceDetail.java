package com.ericsson.eso.services.domain.serviceinstances;

import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({ "creTime", "serviceModelID", "topology", "id", "name" })
public class ServiceInstanceDetail {

	@JsonProperty("creTime")
	private String creTime;
	@JsonProperty("serviceModelID")
	private String serviceModelID;
	@JsonProperty("topology")
	private ServiceInstanceTopology topology;
	@JsonProperty("id")
	private String id;
	@JsonProperty("name")
	private String name;
	@JsonIgnore
	private Map<String, Object> additionalProperties = new HashMap<String, Object>();

	@JsonProperty("creTime")
	public String getCreTime() {
		return creTime;
	}

	@JsonProperty("creTime")
	public void setCreTime(String creTime) {
		this.creTime = creTime;
	}

	@JsonProperty("serviceModelID")
	public String getServiceModelID() {
		return serviceModelID;
	}

	@JsonProperty("serviceModelID")
	public void setServiceModelID(String serviceModelID) {
		this.serviceModelID = serviceModelID;
	}

	@JsonProperty("topology")
	public ServiceInstanceTopology getTopology() {
		return topology;
	}

	@JsonProperty("topology")
	public void setTopology(ServiceInstanceTopology topology) {
		this.topology = topology;
	}

	@JsonProperty("id")
	public String getId() {
		return id;
	}

	@JsonProperty("id")
	public void setId(String id) {
		this.id = id;
	}

	@JsonProperty("name")
	public String getName() {
		return name;
	}

	@JsonProperty("name")
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

}
