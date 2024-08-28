package com.ericsson.eso.services.domain.plugins;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
//@JsonPropertyOrder({"id", "name", "uploadTime", "version"})
public class PluginDetail {
	
	@JsonProperty("upload_time")
	private String upload_time;
	@JsonProperty("version")
	private String version;
	@JsonProperty("plugin_name")
	private String plugin_name;
	
	
	public PluginDetail() {
		super();
	}
	public PluginDetail(String upload_time, String version, String plugin_name) {
		super();
		this.upload_time = upload_time;
		this.version = version;
		this.plugin_name = plugin_name;
	}
	public String getUpload_time() {
		return upload_time;
	}
	public void setUpload_time(String upload_time) {
		this.upload_time = upload_time;
	}
	public String getVersion() {
		return version;
	}
	public void setVersion(String version) {
		this.version = version;
	}
	public String getPlugin_name() {
		return plugin_name;
	}
	public void setPlugin_name(String plugin_name) {
		this.plugin_name = plugin_name;
	}
	
	@JsonProperty("id")
	public String getId() {
		return plugin_name + "-" + version;
	}


	@Override
	public String toString() {
		StringBuilder strBuilder = new StringBuilder();
		strBuilder.append("id").append(":").append(getId());
		strBuilder.append(", uploadTIme").append(":").append(upload_time);
		strBuilder.append(", version").append(":").append(version);
		strBuilder.append(", name").append(":").append(plugin_name);
		return strBuilder.toString();
	}
}
