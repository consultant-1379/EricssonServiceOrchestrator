package com.ericsson.eso.services.service;

import org.springframework.context.ApplicationEvent;

/**
 * This is an optional class used in publishing application events.
 * This can be used to inject events into the Spring Boot audit management endpoint.
 */
public class EsoServiceEvent extends ApplicationEvent {

    public EsoServiceEvent(Object source) {
        super(source);
    }

    @Override
    public String toString() {
        return "ESO Service Event";
    }
}