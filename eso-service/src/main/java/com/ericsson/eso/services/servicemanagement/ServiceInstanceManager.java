package com.ericsson.eso.services.servicemanagement;

import com.ericsson.eso.services.api.rest.requestdata.ServiceExecutionRequestData;
import com.ericsson.eso.services.api.rest.requestdata.ServiceInstanceRequestData;
import com.ericsson.eso.services.domain.common.ExecutionStatus;
import com.ericsson.eso.services.domain.serviceexecutions.ServiceExecution;
import com.ericsson.eso.services.domain.serviceinstances.ServiceInstance;
import com.ericsson.eso.services.domain.serviceinstances.ServiceInstanceDetail;
import com.ericsson.eso.services.domain.serviceinstances.ServiceInstanceRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

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
public class ServiceInstanceManager {
	
    private static final Logger LOG = LoggerFactory.getLogger(ServiceInstanceManager.class);

    @Autowired
    private ServiceInstanceRepository serviceInstanceRepository;
    @Autowired
    private ServiceExecutionManager serviceExecutionManager;
    @Autowired
    private ServiceModelManager serviceModelManager;

    @Autowired
    CounterService counterService;

    @Autowired
    GaugeService gaugeService;


    public ServiceInstanceDetail createServiceInstance(ServiceInstanceRequestData serviceInstanceRequestData, boolean install) {
    	ServiceInstanceDetail createdServiceInstance =  serviceInstanceRepository.create(serviceInstanceRequestData);
        if (install && null != createdServiceInstance) {
        	try {
        		Map<String, String> inputs = new HashMap<>();
				serviceExecutionManager.createInstallWorkflow(createServiceExecutionRequestData(createdServiceInstance.getId(), inputs));
        	}catch (Exception e) {
        		LOG.error("Failed to start 'INSTALL' workflow", e);
        	}
		}
        return createdServiceInstance;
    }

    public ServiceInstanceDetail getServiceInstance(String serviceInstanceId) {
        return serviceInstanceRepository.findOne(serviceInstanceId);
    }

    public void deleteServiceInstance(String serviceInstanceId) {
    	ScheduledExecutorService scheduledThreadPool = Executors.newScheduledThreadPool(1);    
    	scheduledThreadPool.schedule(new ServiceInstanceDeleteManager(this, serviceExecutionManager, serviceInstanceId), 1, TimeUnit.MILLISECONDS);
    }
    
    public void delete(String serviceInstanceId) {
    	serviceInstanceRepository.delete(serviceInstanceId);
    }
    
    public void deleteServiceInstances(List<String> serviceInstanceNames) {
    	serviceInstanceRepository.delete(serviceInstanceNames);
    }

    public List<ServiceInstance> getAllServiceInstances() {
    	LOG.info("getAllServiceInstances()");
        List<ServiceInstance> pageOfServiceInstances = serviceInstanceRepository.findAll();

        for(ServiceInstance serviceInstance : pageOfServiceInstances) {
        	//TODO get service to add extra retail required
        	serviceInstance.setLastServiceExecution(serviceExecutionManager.findLastExecutionForServiceInstanceId(serviceInstance.getId()));
        	serviceInstance.setServiceModelName(serviceModelManager.getServiceModelNameForId(serviceInstance.getServiceModelID()));
        }
        return pageOfServiceInstances;
    }
    
	protected ServiceExecutionRequestData createServiceExecutionRequestData(String serviceInstanceId, Map<String, String> inputs) {
		ServiceExecutionRequestData serviceExecutionRequestData= new ServiceExecutionRequestData();
		serviceExecutionRequestData.setServiceInstanceId(serviceInstanceId);
		serviceExecutionRequestData.setInputs(inputs);
		return serviceExecutionRequestData;
	}
}
