package com.ericsson.eso.services.api.rest.responsedata;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ExecutedWorkflowData {
	private String workflowName;
	private String startDateTime;
	private String endDateTime;
	private Integer status;
	private Integer executionState;
	private String errorDetails;
	
	public String getWorkflowName() {
		return workflowName;
	}
	
	public void setWorkflowName(String workflowName) {
		this.workflowName = workflowName;
	}
	
	public String getStartDateTime() {
		return startDateTime;
	}
	
	public void setStartDateTime(String startDateTime) {
		this.startDateTime = startDateTime;
	}
	
	public String getEndDateTime() {
		return endDateTime;
	}
	public void setEndDateTime(String endDateTime) {
		this.endDateTime = endDateTime;
	}
	
	public Integer getStatus() {
		return status;
	}
	
	public void setStatus(Integer status) {
		this.status = status;
	}
	
	public Integer getExecutionState() {
		return executionState;
	}
	
	public void setExecutionState(Integer executionState) {
		this.executionState = executionState;
	}
	
	public String getErrorDetails() {
		return errorDetails;
	}
	
	public void setErrorDetails(String errorDetails) {
		this.errorDetails = errorDetails;
	}

	@Override
	public String toString() {
		StringBuilder strBuilder = new StringBuilder();
		strBuilder.append("workflowName").append(":").append(workflowName);
		strBuilder.append(", startDateTime").append(":").append(startDateTime);
		strBuilder.append(", endDateTime").append(":").append(endDateTime);
		strBuilder.append(", status").append(":").append(status);
		strBuilder.append(", executionState").append(":").append(executionState);
		strBuilder.append(", errorDetails").append(":").append(errorDetails);

		return strBuilder.toString();
	}

}
