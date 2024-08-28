package com.ericsson.eso.services.servicemanagement;

import com.ericsson.eso.services.api.rest.requestdata.ServiceExecutionRequestData;
import com.ericsson.eso.services.api.rest.requestdata.ServiceInstanceRequestData;
import com.ericsson.eso.services.domain.serviceexecutions.ServiceExecution;
import com.ericsson.eso.services.domain.serviceexecutions.ServiceExecutionRepository;
import com.ericsson.eso.services.domain.serviceinstances.ServiceInstance;
import com.ericsson.eso.services.domain.serviceinstances.ServiceInstanceDetail;
import com.ericsson.eso.services.domain.serviceinstances.ServiceInstanceRepository;
import com.ericsson.eso.services.domain.servicemodels.ServiceModelRepository;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.metrics.CounterService;
import org.springframework.boot.actuate.metrics.GaugeService;
import org.springframework.stereotype.Service;

/*
 * Sample service to demonstrate what the API would use to get things done
 */
@Service
public class ServiceExecutionManager {
	
	public static final String INSTALL = "install";
	
	public static final String UNINSTALL = "uninstall";

    private static final Logger LOG = LoggerFactory.getLogger(ServiceExecutionManager.class);

    @Autowired
    private ServiceExecutionRepository serviceExecutionRepository;

    @Autowired
    CounterService counterService;

    @Autowired
    GaugeService gaugeService;

    public String getServiceExecutionStatus(String serviceExecutionId) {
    	ServiceExecution serviceExecution = serviceExecutionRepository.findOne(serviceExecutionId);
        return serviceExecution.getStatus();
    }

    public ServiceExecution createInstallWorkflow(ServiceExecutionRequestData serviceExecutionRequestData) {
    	serviceExecutionRequestData.setWorkflow(INSTALL);
        return serviceExecutionRepository.startWorkflow(serviceExecutionRequestData);
    }

    public ServiceExecution createUninstallWorkflow(ServiceExecutionRequestData serviceExecutionRequestData) {
    	serviceExecutionRequestData.setWorkflow(UNINSTALL);
        return serviceExecutionRepository.startWorkflow(serviceExecutionRequestData);
    }

	public ServiceExecution findLastExecutionForServiceInstanceId(String serviceInstanceId) {
    	return serviceExecutionRepository.findLastExecutionForServiceInstanceId(serviceInstanceId);
	} 

   
}
