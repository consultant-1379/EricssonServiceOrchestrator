package com.ericsson.eso.services.api.rest.requestdata;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.ericsson.eso.services.api.rest.ServiceInstanceRequest;


@Service
public class ApiRequestRender {
	
    private static final Logger LOG = LoggerFactory.getLogger(ApiRequestRender.class);

	public ServiceInstanceRequestData convertServiceInstanceRequest(ServiceInstanceRequest serviceInstanceRequest) {
    	LOG.info("convertServiceInstanceRequest(): {}", serviceInstanceRequest);
    	ServiceInstanceRequestData serviceInstance = new ServiceInstanceRequestData();
    	serviceInstance.setInputs(serviceInstanceRequest.getInputs());
    	serviceInstance.setName(serviceInstanceRequest.getName());
    	serviceInstance.setServiceModelID(serviceInstanceRequest.getServiceModelId());
		return serviceInstance;
	}
	
	
}
