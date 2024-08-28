package com.ericsson.eso.services.domain.serviceexecutions;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ServiceExecution {
	
	@JsonProperty("id")
	private String id;
	@JsonProperty("serviceInstanceId")
	private String serviceInstanceId;
	@JsonProperty("workflow")
	private String workflow;
	@JsonProperty("starttime")
	private String starttime;
	@JsonProperty("endtime")
	private String endtime;
	@JsonProperty("status")
	private String status;
	@JsonProperty("serviceInstanceName")
	private String serviceInstanceName;
	
	@JsonIgnore
	private Map<String, Object> additionalProperties = new HashMap<>();
	
	@JsonProperty("id")
	public String getId() {
		return id;
	}
	
	public void setId(String id) {
		this.id = id;
	}
	
	@JsonProperty("serviceInstanceId")
	public String getServiceInstanceId() {
		return serviceInstanceId;
	}
	
	public void setServiceInstanceId(String serviceInstanceId) {
		this.serviceInstanceId = serviceInstanceId;
	}
	
	@JsonProperty("workflow")
	public String getWorkflow() {
		return workflow;
	}
	
	public void setWorkflow(String workflow) {
		this.workflow = workflow;
	}
	
	@JsonProperty("starttime")
	public String getStarttime() {
		return starttime;
	}
	
	public void setStarttime(String starttime) {
		this.starttime = starttime;
	}
	
	@JsonProperty("endtime")
	public String getEndtime() {
		return endtime;
	}
	
	public void setEndtime(String endtime) {
		this.endtime = endtime;
	}
	
	@JsonProperty("status")
	public String getStatus() {
		return status;
	}
	
	public void setStatus(String status) {
		this.status = status;
	}

	@JsonProperty("serviceInstanceName")
	public String getServiceInstanceName() {
		return serviceInstanceName;
	}

	public void setServiceInstanceName(String serviceInstanceName) {
		this.serviceInstanceName = serviceInstanceName;
	}

	@JsonAnySetter
	public void setAdditionalProperty(String name, Object value) {
		this.additionalProperties.put(name, value);
	}
	
	@JsonIgnore
	public boolean isLaterServiceExecution(ServiceExecution serviceExecution) {
		return null != serviceExecution.starttime && null != this.starttime && isLater(serviceExecution.starttime, this.starttime); 
	}
	
	@Override
	public String toString() {
		StringBuilder strBuilder = new StringBuilder();
		strBuilder.append("id").append(":").append(id);
		strBuilder.append(", serviceInstanceId").append(":").append(serviceInstanceId);
		strBuilder.append(", serviceInstanceName").append(":").append(serviceInstanceName);
		strBuilder.append(", workflow").append(":").append(workflow);
		strBuilder.append(", starttime").append(":").append(starttime);
		strBuilder.append(", endtime").append(":").append(endtime);
		strBuilder.append(", status").append(":").append(status);
		strBuilder.append(", additionalProperties").append(":").append(additionalProperties);

		return strBuilder.toString();
	}
	
	private boolean isLater(String time1, String time2) {
		return Timestamp.valueOf(time2).after(Timestamp.valueOf(time1));
	}
}
