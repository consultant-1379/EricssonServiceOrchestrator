package com.ericsson.eso.services.service;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import javax.validation.constraints.NotNull;

/*
 * demonstrates how service-specific properties can be injected
 */
@ConfigurationProperties(prefix = "eso.service", ignoreUnknownFields = false)
@Component
public class ServiceProperties {

    @NotNull // you can also create configurationPropertiesValidator
	private String name = "Empty";

	public String getName() {
		return this.name;
	}

	public void setName(String name) {
		this.name = name;
	}

}
