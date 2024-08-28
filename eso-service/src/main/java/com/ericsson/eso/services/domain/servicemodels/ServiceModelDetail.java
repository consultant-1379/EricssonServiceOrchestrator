package com.ericsson.eso.services.domain.servicemodels;

import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.annotation.*;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({ "description", "name", "creTime", "id", "mainSTfile", "topology" })
public class ServiceModelDetail {

    @JsonProperty("description")
    private Object description;
    @JsonProperty("name")
    private String name;
    @JsonProperty("creTime")
    private String creTime;
    @JsonProperty("id")
    private String id;
    @JsonProperty("mainSTfile")
    private String mainSTfile;
    @JsonProperty("topology")
    private ServiceModelTopology topology;
    @JsonIgnore
    private final Map<String, Object> additionalProperties = new HashMap<String, Object>();

    @JsonProperty("description")
    public Object getDescription() {
        return description;
    }

    @JsonProperty("description")
    public void setDescription(final Object description) {
        this.description = description;
    }

    @JsonProperty("name")
    public String getName() {
        return name;
    }

    @JsonProperty("name")
    public void setName(final String name) {
        this.name = name;
    }

    @JsonProperty("creTime")
    public String getCreTime() {
        return creTime;
    }

    @JsonProperty("creTime")
    public void setCreTime(final String creTime) {
        this.creTime = creTime;
    }

    @JsonProperty("id")
    public String getId() {
        return id;
    }

    @JsonProperty("id")
    public void setId(final String id) {
        this.id = id;
    }

    @JsonProperty("mainSTfile")
    public String getMainSTfile() {
        return mainSTfile;
    }

    @JsonProperty("mainSTfile")
    public void setMainSTfile(final String mainSTfile) {
        this.mainSTfile = mainSTfile;
    }

    @JsonProperty("topology")
    public ServiceModelTopology getTopology() {
        return topology;
    }

    @JsonProperty("topology")
    public void setTopology(final ServiceModelTopology topology) {
        this.topology = topology;
    }

    @JsonAnyGetter
    public Map<String, Object> getAdditionalProperties() {
        return this.additionalProperties;
    }

    @JsonAnySetter
    public void setAdditionalProperty(final String name, final Object value) {
        this.additionalProperties.put(name, value);
    }
    

}
