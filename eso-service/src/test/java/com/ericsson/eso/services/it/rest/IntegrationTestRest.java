package com.ericsson.eso.services.it.rest;

import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

public class IntegrationTestRest {

	public static int checkTotal(String uri) {
		HttpEntity<String> entity = new HttpEntity<String>(null, new HttpHeaders());
		ResponseEntity<String> response =  new TestRestTemplate().exchange(uri, HttpMethod.GET, entity, String.class);
		char total = response.getBody().toString().charAt(response.getBody().toString().length() - 2);
		return Character.getNumericValue(total);	
	}
}
