package com.ericsson.eso.services.api.rest.requestdata;

import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PluginRequestData {

	@JsonProperty("plugin_file")
	private MultipartFile plugin_file;

	public PluginRequestData() {
		super();
	}

	public PluginRequestData(MultipartFile plugin_file) {
		this.plugin_file = plugin_file;
	}

	public MultipartFile getPlugin_file() {
		return plugin_file;
	}

	public void setPlugin_file(MultipartFile plugin_file) {
		this.plugin_file = plugin_file;
	}

	@Override
	public String toString() {
		StringBuilder strBuilder = new StringBuilder();
		strBuilder.append("plugin_file:").append(plugin_file);
		return strBuilder.toString();
	}
	
}
