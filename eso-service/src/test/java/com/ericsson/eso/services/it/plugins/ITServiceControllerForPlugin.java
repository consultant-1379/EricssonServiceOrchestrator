package com.ericsson.eso.services.it.plugins;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import com.ericsson.eso.services.Application;
import com.ericsson.eso.services.it.rest.IntegrationTestRest;

import cucumber.api.java.en.Given;
import cucumber.api.java.en.Then;
import cucumber.api.java.en.When;

@SpringBootTest(classes = Application.class)
public class ITServiceControllerForPlugin {

	//change the BASE_URI suits your {docker-ip}
	public static final String BASE_URI = "http://172.18.0.5:8090/eso-service/v1";
	public static final String PLUGIN_URI = BASE_URI + "/plugins";
	
	@Given("^No plugin exists$")
	public void no_plugin_exists() throws Throwable {
		assert IntegrationTestRest.checkTotal(PLUGIN_URI) == 0;
	}

	@When("^Client calls GET on /plugins$")
	public void client_calls_GET_on_plugins() throws Throwable {
		HttpEntity<String> entity = new HttpEntity<String>(null, new HttpHeaders());
		ResponseEntity<String> response = new TestRestTemplate()
				.exchange(PLUGIN_URI, HttpMethod.GET, entity, String.class);
		client_receives_and_empty_result_set(entity, response);
	}

	@Then("^Client receives (\\d+) and empty result set$")
	public void client_receives_and_empty_result_set(HttpEntity<String> entity, ResponseEntity<String> response)
			throws Throwable {
		String expected = "{\"items\":[],\"total\":0}";
		assert response.getStatusCodeValue() == 200;
		assert response.getBody().equals(expected);
	}
}
