package com.ericsson.eso.services.api.rest.responsedata;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ServiceModelResponseData {

    @JsonProperty("id")
    private String id;

    @JsonProperty("description")
    private String description;

    @JsonProperty("name")
    private String name;

    @JsonProperty("service_template_file_name")
    private String service_template_file_name;

    @JsonProperty("upload_time")
    private String upload_time;

    public String getId() {
        return id;
    }

    public void setId(final String id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(final String description) {
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public void setName(final String name) {
        this.name = name;
    }

    public String getService_template_file_name() {
        return service_template_file_name;
    }

    public void setService_template_file_name(final String service_template_file_name) {
        this.service_template_file_name = service_template_file_name;
    }

    public String getUpload_time() {
        return upload_time;
    }

    public void setUpload_time(final String upload_time) {
        this.upload_time = upload_time;
    }

    @Override
    public String toString() {
        return "ServiceModelResponseData [id=" + id + ", description=" + description + ", name=" + name + ", service_Template_File_Name=" + service_template_file_name + ", upload_Time=" + upload_time
                + "]";
    }

}
