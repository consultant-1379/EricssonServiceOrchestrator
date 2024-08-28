package com.ericsson.eso.services.api.rest.responsedata;

import static org.junit.Assert.*;

import java.io.IOException;

import org.junit.Test;

import com.ericsson.eso.services.domain.serviceinstances.ServiceInstanceDetail;
import com.fasterxml.jackson.databind.ObjectMapper;

public class Tester {

	@Test
	public void test() {
		String detail = "{\"creTime\": \"2018-01-09 13:55:39.708308\", \"serviceModelID\": \"16c65160-757b-4031-8887-744d48d3bc48\", "
				+ "\"topology\": {\"inputs\": [{\"type\": \"string\", \"name\": \"subnetwork_blueprint\", \"value\": \"massive-mtc\"},"
				+ "{\"type\": \"string\", \"name\": \"subnetwork_name\", \"value\": \"test\"}], "
				+ "\"nodes\": [{\"nodeattributes\": "
				+ "[{\"type\": \"string\", \"name\": \"state\", \"value\": \"initial\"}, "
				+ "{\"type\": \"string\", \"name\": \"tosca_name\", \"value\": \"subnet-massive-mtc\"}, "
				+ "{\"type\": \"string\", \"name\": \"tosca_id\", \"value\": \"subnet-massive-mtc_1\"}], "
				+ "\"state\": \"initial\", \"name\": \"subnet-massive-mtc_1\", "
				+ "\"relationship\": [], \"nodeproperties\": ["
				+ "{\"type\": \"string\", \"name\": \"host\", \"value\": \"http://131.160.162.95\"}, "
				+ "{\"type\": \"string\", \"name\": \"name\", \"value\": \"test\"}]}], "
				+ "\"outputs\": []}, \"id\": \"6b2aabee-2e8f-451c-9798-3329a177f683\", \"name\": \"test\"}";
		
		try {
			new ObjectMapper().readValue(detail, ServiceInstanceDetail.class);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

}
