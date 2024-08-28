package com.ericsson.eso.services.domain.common;

public enum WorkflowStatus {
    INSTALL("install"),
    UNINSTALL("uninstall");

    private String workflow;

    WorkflowStatus(String workflow) {
        this.workflow = workflow;
    }

    public String workflow() {
        return workflow;
    }
}
