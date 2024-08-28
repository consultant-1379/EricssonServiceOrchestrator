package com.ericsson.eso.services.servicemanagement;

import java.util.HashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ericsson.eso.services.domain.common.ExecutionStatus;
import com.ericsson.eso.services.domain.common.WorkflowStatus;
import com.ericsson.eso.services.domain.serviceexecutions.ServiceExecution;

public class ServiceInstanceDeleteManager implements Runnable {
	
	private ServiceInstanceManager serviceInstanceManager;
	private ServiceExecutionManager serviceExecutionManager;
	private String serviceInstanceId;
	
    private static final Logger LOG = LoggerFactory.getLogger(ServiceInstanceDeleteManager.class);

	
	public ServiceInstanceDeleteManager(ServiceInstanceManager serviceInstanceManager, ServiceExecutionManager serviceExecutionManager, String serviceInstanceId) {
		this.serviceInstanceManager = serviceInstanceManager;
		this.serviceExecutionManager = serviceExecutionManager;
		this.serviceInstanceId = serviceInstanceId;
	}

	@Override
	public void run() {
		LOG.info("run()");
    	ServiceExecution lastServiceExecution = serviceExecutionManager.findLastExecutionForServiceInstanceId(serviceInstanceId);
    	if(WorkflowStatus.INSTALL.workflow().equalsIgnoreCase(lastServiceExecution.getWorkflow())) {
    		LOG.info("run() Service installed, going to start 'Uninstall'");
    		ServiceExecution serviceExecution = serviceExecutionManager.createUninstallWorkflow(serviceInstanceManager.createServiceExecutionRequestData(serviceInstanceId, new HashMap()));
    		LOG.info("run() Started Uninstall... executionId: {}", serviceExecution.getId());
    		while(isNotExecuted(serviceExecution.getId())) {
	    		try {
	        		LOG.debug("run() Uninstall not complete, going to sleep for a while...");
					Thread.sleep(1000);
				} catch (InterruptedException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
	    	}
    	} else {
    		LOG.info("run() Service already uninstalled.");
    	}
    	serviceInstanceManager.delete(serviceInstanceId);		
	}
	
	private boolean isNotExecuted(String serviceExecutionId) {
		return !(ExecutionStatus.STARTED.executionstatus().equals(serviceExecutionManager.getServiceExecutionStatus(serviceExecutionId)));
	}

}
