package com.ericsson.eso.services.domain.plugins;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonPropertyOrder("message")

public class PluginPost {

	@JsonProperty("message")
	private String message;

	public PluginPost() {
		super();
	}

	public PluginPost(String message) {
		super();
		this.message = message;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}
	
	@Override
	public String toString() {
		StringBuilder strBuilder = new StringBuilder();
		strBuilder.append("message").append(":").append(message);
		return strBuilder.toString();
	}
}
