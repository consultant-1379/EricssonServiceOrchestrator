package com.ericsson.eso.services.adp.logging;

import java.util.HashMap;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({ "message", "level", "source", "sourceSyntax", "date" })
public class AdpLoggingEvent {

	@JsonProperty("message")
	private String message;
	@JsonProperty("level")
	private String level;
	@JsonProperty("source")
	private String source;
	@JsonProperty("sourceSyntax")
	private String sourceSyntax;
	@JsonProperty("date")
	private String date;
	@JsonIgnore
	private Map<String, Object> additionalProperties = new HashMap<String, Object>();

	@JsonProperty("message")
	public String getMessage() {
		return message;
	}

	@JsonProperty("message")
	public void setMessage(String message) {
		this.message = message;
	}

	@JsonProperty("level")
	public String getLevel() {
		return level;
	}

	@JsonProperty("level")
	public void setLevel(String level) {
		this.level = level;
	}

	@JsonProperty("source")
	public String getSource() {
		return source;
	}

	@JsonProperty("source")
	public void setSource(String source) {
		this.source = source;
	}

	@JsonProperty("sourceSyntax")
	public String getSourceSyntax() {
		return sourceSyntax;
	}

	@JsonProperty("sourceSyntax")
	public void setSourceSyntax(String sourceSyntax) {
		this.sourceSyntax = sourceSyntax;
	}

	@JsonProperty("date")
	public String getDate() {
		return date;
	}

	@JsonProperty("date")
	public void setDate(String date) {
		this.date = date;
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
