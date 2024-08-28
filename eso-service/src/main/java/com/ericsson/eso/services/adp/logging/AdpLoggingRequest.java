package com.ericsson.eso.services.adp.logging;

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
@JsonPropertyOrder({ "logPlane", "events" })
public class AdpLoggingRequest {

	@JsonProperty("logPlane")
	private String logPlane;
	@JsonProperty("events")
	private List<AdpLoggingEvent> events = null;
	@JsonIgnore
	private Map<String, Object> additionalProperties = new HashMap<String, Object>();

	@JsonProperty("logPlane")
	public String getLogPlane() {
		return logPlane;
	}

	@JsonProperty("logPlane")
	public void setLogPlane(String logPlane) {
		this.logPlane = logPlane;
	}

	@JsonProperty("events")
	public List<AdpLoggingEvent> getEvents() {
		return events;
	}

	@JsonProperty("events")
	public void setEvents(List<AdpLoggingEvent> events) {
		this.events = events;
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