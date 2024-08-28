package com.ericsson.eso.services.api.rest.responsedata;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ServiceInstanceResponseData implements Comparable {
	
	//TODO - implement proper JSON annotation when API is fully defined
	private String serviceInstanceName;
	private String serviceInstanceId;
	private String initializationTime;
	private String serviceModelName;
	private Map inputs;
	private ExecutedWorkflowData lastExecutedWorkflow;
	
	public String getServiceInstanceName() {
		return serviceInstanceName;
	}
	
	public void setServiceInstanceName(String serviceInstanceName) {
		this.serviceInstanceName = serviceInstanceName;
	}
	
	public String getInitializationTime() {
		return initializationTime;
	}
	
	public void setInitializationTime(String initializationTime) {
		this.initializationTime = initializationTime;
	}
	
	public String getServiceModelName() {
		return serviceModelName;
	}
	
	public void setServiceModelName(String serviceModelName) {
		this.serviceModelName = serviceModelName;
	}
	
	public String getServiceInstanceId() {
		return serviceInstanceId;
	}

	public void setServiceInstanceId(String serviceInstanceId) {
		this.serviceInstanceId = serviceInstanceId;
	}
	
	public Map getInputs() {
		return inputs;
	}
	
	public void setInputs(Map inputs) {
		this.inputs = inputs;
	}

	public ExecutedWorkflowData getLastExecutedWorkflow() {
		return lastExecutedWorkflow;
	}

	public void setLastExecutedWorkflow(ExecutedWorkflowData lastExecutedWorkflow) {
		this.lastExecutedWorkflow = lastExecutedWorkflow;
	}
	
	@Override
	public int compareTo(Object object) {
		if(object instanceof ServiceInstanceResponseData) {
			ServiceInstanceResponseData otherServiceInstanceResponseData = (ServiceInstanceResponseData)object;
			return (this.serviceInstanceName.compareTo(otherServiceInstanceResponseData.getServiceInstanceName()));
		} else {
			return -1;
		}
	}
	
	@Override
	public String toString() {
		StringBuilder strBuilder = new StringBuilder();
		strBuilder.append("serviceInstanceName").append(":").append(serviceInstanceName);
		strBuilder.append(", serviceInstanceId").append(":").append(serviceInstanceId);
		strBuilder.append(", initializationTime").append(":").append(initializationTime);
		strBuilder.append(", serviceModelName").append(":").append(serviceModelName);
		strBuilder.append(", inputs").append(":").append(inputs);
		strBuilder.append(", lastExecutedWorkflow").append(":").append(lastExecutedWorkflow);

		return strBuilder.toString();
	}

	
}
