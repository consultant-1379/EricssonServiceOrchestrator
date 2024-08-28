package com.ericsson.eso.services.domain.serviceexecutions;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.ericsson.eso.services.ToscaoManagerService;
import com.ericsson.eso.services.api.rest.requestdata.ServiceExecutionRequestData;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ServiceExecutionRepository {
	
	@Autowired
	private ToscaoManagerService toscaoManagerService;
	
	private final String serviceExecutionsPath = "/service-executions";
	private final String workflowPath = serviceExecutionsPath + "/workflow";
	
	private static final Logger LOG = LoggerFactory.getLogger(ServiceExecutionRepository.class);

	private ObjectMapper mapper = new ObjectMapper();

	public List<ServiceExecution> findAll() {
		LOG.info("findAll() using toscaoService @{}", toscaoManagerService.getToscaoServiceUrl());
		List<ServiceExecution> serviceExecutionList = new ArrayList<ServiceExecution>();

		RestTemplate restTemplate = new RestTemplate();
		String uri = toscaoManagerService.getToscaoServiceUrl() + serviceExecutionsPath;
		try {
			String responseString = restTemplate.getForObject(uri, String.class);
			List<Map<String, String>> response = mapper.readValue(responseString, List.class);

			for (Map<String, String> execution : response) {
				ServiceExecution serviceExecution = new ObjectMapper().readValue(mapper.writeValueAsString(execution),
						ServiceExecution.class);
				serviceExecutionList.add(serviceExecution);
			}

		} catch (Exception e) {
			LOG.error("findAll() error: ", e);
		}		
		
		LOG.info("findAll() returning: {} service executions.", serviceExecutionList.size());
		return serviceExecutionList;
	}
	
	public ServiceExecution startWorkflow(ServiceExecutionRequestData serviceExecutionRequestData) {
		LOG.info("startWorkflow() using toscaoService @{}, execution: {}", toscaoManagerService.getToscaoServiceUrl(), serviceExecutionRequestData);

		RestTemplate restTemplate = new RestTemplate();
		String uri = toscaoManagerService.getToscaoServiceUrl() + workflowPath;
		try {
			ServiceExecution serviceExecution = restTemplate.postForObject(uri, serviceExecutionRequestData, ServiceExecution.class);
			LOG.info("startWorkflow() returning: {} service executions.", serviceExecution);
			return serviceExecution;
		} catch (Exception e) {
			LOG.error("startWorkflow() error: ", e);
			return null;
		}		
	}

	public List<ServiceExecution> findAllExecutionsForServiceInstanceId(String serviceInstanceId) {
		LOG.info("findAllExecutionsForServiceInstanceId() for Service Instance: {}", serviceInstanceId);

		List<ServiceExecution> filteredServiceExecutionList = new ArrayList<ServiceExecution>();
		
		for(ServiceExecution serviceExecution : findAll()) {
			if(isExecutionForServiceInstance(serviceInstanceId, serviceExecution))
				filteredServiceExecutionList.add(serviceExecution);
		}
		
		LOG.info("findAllExecutionsForServiceInstanceId() for Service Instance: {}, returning: {} executuions.", serviceInstanceId, filteredServiceExecutionList.size());
        return filteredServiceExecutionList;
	}
	
	public ServiceExecution findLastExecutionForServiceInstanceId(String serviceInstanceId) {
		LOG.info("findLastExecutionForServiceInstanceId() for Service Instance: {}", serviceInstanceId);
		ServiceExecution lastServiceExecution = null;
		try {
			List<ServiceExecution> filteredServiceExecutionList = findAllExecutionsForServiceInstanceId(serviceInstanceId);
			if(filteredServiceExecutionList.size() >= 1) {
				lastServiceExecution = filteredServiceExecutionList.get(0);
				if(filteredServiceExecutionList.size() > 1) {
					for(ServiceExecution serviceExecution : filteredServiceExecutionList) {
						if(serviceExecution.isLaterServiceExecution(lastServiceExecution)) {
							lastServiceExecution = serviceExecution;
						}
					}
				}
			}
		} catch (Exception e) {
			LOG.error("findLastExecutionForServiceInstanceId() failed: {}", e);
		}
		LOG.info("findLastExecutionForServiceInstanceId() for Service Instance: {}, returning: {}", serviceInstanceId, lastServiceExecution);

        return lastServiceExecution;
	}

	private boolean isExecutionForServiceInstance(String serviceInstanceId, ServiceExecution serviceExecution) {
		return (null != serviceExecution.getServiceInstanceId()
				&& serviceExecution.getServiceInstanceId().equals(serviceInstanceId));
	}

	public ServiceExecution findOne(String serviceExecutionId) {
		LOG.info("findOne() using toscaoService @{}, serviceExecutionId:{}", toscaoManagerService.getToscaoServiceUrl(), serviceExecutionId);
		RestTemplate restTemplate = new RestTemplate();
		String uri = toscaoManagerService.getToscaoServiceUrl() + serviceExecutionsPath + "/" + serviceExecutionId;
		try {
			String responseString = restTemplate.getForObject(uri, String.class);
			ServiceExecution serviceExecution = mapper.readValue(responseString, ServiceExecution.class);
			LOG.info("findAll() returning: {} .", serviceExecution);
			return serviceExecution;

		} catch (IOException e) {
			LOG.error("findAll() error: ", e);
			return null;
		}		
	}

}
