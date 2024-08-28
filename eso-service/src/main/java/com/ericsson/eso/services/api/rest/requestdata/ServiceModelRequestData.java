package com.ericsson.eso.services.api.rest.requestdata;

import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ServiceModelRequestData {

    @JsonProperty("name")
    private String name;

    @JsonProperty("description")
    private String description;

    @JsonProperty("file")
    private MultipartFile file;

    public ServiceModelRequestData(final String name, final MultipartFile file, final String description) {
        this.name = name;
        this.file = file;
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public void setName(final String name) {
        this.name = name;
    }

    public MultipartFile getFile() {
        return file;
    }

    public void setFile(final MultipartFile file) {
        this.file = file;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(final String description) {
        this.description = description;
    }

    @Override
    public String toString() {
        final StringBuilder strBuilder = new StringBuilder();
        strBuilder.append("name").append(" : ").append(name);
        strBuilder.append(", file").append(" : ").append(file);
        strBuilder.append(", description").append(" : ").append(description);
        return strBuilder.toString();
    }
}
