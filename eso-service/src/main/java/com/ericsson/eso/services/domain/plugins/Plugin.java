package com.ericsson.eso.services.domain.plugins;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonPropertyOrder({"id", "name", "uploadTime", "version"})
public class Plugin {

	@JsonProperty("uploadTime")
	private String uploadTime;
	@JsonProperty("version")
	private String version;
	@JsonProperty("name")
	private String name;

	public Plugin() {
		super();
	}

	public Plugin(String uploadTime, String version, String name) {
		super();
		this.uploadTime = uploadTime;
		this.version = version;
		this.name = name;
	}

	public String getUploadTime() {
		return uploadTime;
	}

	public void setUploadTime(String uploadTime) {
		this.uploadTime = uploadTime;
	}

	public String getVersion() {
		return version;
	}

	public void setVersion(String version) {
		this.version = version;
	}

	public String getName() {
		return name;
	}   

	public void setName(String name) {
		this.name = name;
	}

	@Override
	public String toString() {
		StringBuilder strBuilder = new StringBuilder();
		strBuilder.append("plugin_name").append(":").append(name);
		strBuilder.append(", upload_time").append(":").append(uploadTime);
		strBuilder.append(", version").append(":").append(version);
		return strBuilder.toString();
	}
}
