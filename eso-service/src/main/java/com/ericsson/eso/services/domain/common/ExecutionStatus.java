package com.ericsson.eso.services.domain.common;

public enum ExecutionStatus {
    STARTED("STARTED"),
    SUCCEEDED("SUCCEEDED"),
    FAILED("FAILED");

    private String executionstatus;

    ExecutionStatus(String executionstatus) {
        this.executionstatus = executionstatus;
    }

    public String executionstatus() {
        return executionstatus;
    }
}
