package com.ericsson.eso.services.domain.servicemodels;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class RestTemplateAdapter {
	
	public String getStringForObject(String uri) {
		RestTemplate restTemplate = new RestTemplate();
		return restTemplate.getForObject(uri, String.class);
	}


}
