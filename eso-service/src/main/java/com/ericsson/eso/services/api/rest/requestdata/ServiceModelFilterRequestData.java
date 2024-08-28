/*------------------------------------------------------------------------------
 *******************************************************************************
 * COPYRIGHT Ericsson 2018
 *
 * The copyright to the computer program(s) herein is the property of
 * Ericsson Inc. The programs may be used and/or copied only with written
 * permission from Ericsson Inc. or in accordance with the terms and
 * conditions stipulated in the agreement/contract under which the
 * program(s) have been supplied.
 *******************************************************************************
 *----------------------------------------------------------------------------*/

package com.ericsson.eso.services.api.rest.requestdata;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ServiceModelFilterRequestData {

    @JsonProperty("name")
    private String name;

    @JsonProperty("service_template_file_name")
    private String serviceTemplateFile;

    @JsonProperty("upload_time")
    private String uploadTime;

    @JsonProperty("description")
    private String description;

    public String getName() {
        return name;
    }

    public void setName(final String name) {
        this.name = name;
    }

    public String getServiceTemplateFile() {
        return serviceTemplateFile;
    }

    public void setServiceTemplateFile(final String serviceTemplateFile) {
        this.serviceTemplateFile = serviceTemplateFile;
    }

    public String getUploadTime() {
        return uploadTime;
    }

    public void setUploadTime(final String uploadTime) {
        this.uploadTime = uploadTime;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(final String description) {
        this.description = description;
    }

    @Override
    public String toString() {
        return "FilterRequestData [name=" + name + ", serviceTemplateFile=" + serviceTemplateFile + ", uploadTime=" + uploadTime + ", description=" + description + "]";
    }

    public boolean isNull() {
        if (getName() == null && getDescription() == null && getServiceTemplateFile() == null && getUploadTime() == null) {
            return true;
        }
        return false;
    }

}
