package com.ericsson.eso.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ToscaoManagerService {

    private static final String version = "/toscao/api/v2.0";

    @Value("http://172.17.0.1")
    private String toscaoServiceHost;

    @Value("7001")
    private String toscaoServicePort;

    public String getToscaoServiceUrl() {
        return toscaoServiceHost + ":" + toscaoServicePort + version;
    }

}
