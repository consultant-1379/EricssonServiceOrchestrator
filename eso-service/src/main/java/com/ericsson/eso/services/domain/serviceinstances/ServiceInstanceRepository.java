package com.ericsson.eso.services.domain.serviceinstances;

import java.io.IOException;
import java.util.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.ericsson.eso.services.ToscaoManagerService;
import com.ericsson.eso.services.api.rest.requestdata.ServiceInstanceRequestData;
import com.ericsson.eso.services.exception.ResourceConflictException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ServiceInstanceRepository {
    @Autowired
    private ToscaoManagerService toscaoManagerService;

    private final String serviceInstancesPath = "/service-instances";

    private static final Logger LOG = LoggerFactory.getLogger(ServiceInstanceRepository.class);

    private final ObjectMapper mapper = new ObjectMapper();

    public List<ServiceInstance> findAll() {
        LOG.info("findAll() using toscaoService @ {}", toscaoManagerService.getToscaoServiceUrl());
        final List<ServiceInstance> serviceInstanceList = new ArrayList<ServiceInstance>();
        final RestTemplate restTemplate = new RestTemplate();
        final String uri = toscaoManagerService.getToscaoServiceUrl() + serviceInstancesPath;
        final String responseString = restTemplate.getForObject(uri, String.class);

        try {
            final List<Map<String, String>> response = mapper.readValue(responseString, List.class);

            for (final Map<String, String> instance : response) {
                final ServiceInstance serviceInstance = new ObjectMapper().readValue(mapper.writeValueAsString(instance), ServiceInstance.class);
                serviceInstanceList.add(serviceInstance);
            }

        } catch (final IOException e) {
            LOG.error("findAll() error: ", e);
        }

        return serviceInstanceList;
    }

    public void delete(final String serviceInstanceId) {
        LOG.info("delete() using toscaoService @ {} Service instance id: {}", toscaoManagerService.getToscaoServiceUrl(), serviceInstanceId);
        if (null != serviceInstanceId) {
            final RestTemplate restTemplate = new RestTemplate();
            final String uri = toscaoManagerService.getToscaoServiceUrl() + serviceInstancesPath + "/" + serviceInstanceId;
            try {
                restTemplate.delete(uri);
            } catch (final RestClientException e) {
                //TODO - proper handling
                throw new ResourceConflictException("Service instance could not be deleted.");
            }
        }
    }

    public void delete(final List<String> serviceInstanceNames) {
        LOG.info("delete() using toscaoService @ {} Service instance id: {}", toscaoManagerService.getToscaoServiceUrl(), serviceInstanceNames);
        for (final String serviceInstanceName : serviceInstanceNames) {
            this.delete(serviceInstanceName);
        }
    }

    public ServiceInstanceDetail create(final ServiceInstanceRequestData serviceInstanceRequestData) {
        //TODO - proper error handling
        LOG.info("create() using toscaoService @ {} Service instance: {}", toscaoManagerService.getToscaoServiceUrl(), serviceInstanceRequestData);
        final RestTemplate restTemplate = new RestTemplate();
        final String uri = toscaoManagerService.getToscaoServiceUrl() + serviceInstancesPath;
        final ServiceInstanceDetail serviceInstanceDetail = restTemplate.postForObject(uri, serviceInstanceRequestData, ServiceInstanceDetail.class);
        LOG.info("create() created: {}", serviceInstanceDetail);

        return serviceInstanceDetail;
    }

    public ServiceInstanceDetail findOne(final String serviceInstanceId) {
        LOG.info("findOne() using toscaoService @ {} Service instance id: {}", toscaoManagerService.getToscaoServiceUrl(), serviceInstanceId);
        if (null != serviceInstanceId) {
            return getServiceInstanceDetail(serviceInstanceId);
        } else {
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    public String getServiceInstanceIdForName(final String serviceInstanceName) {
        LOG.info("getServiceInstanceIdForName() using toscaoService @ {} Service instance name: {}", toscaoManagerService.getToscaoServiceUrl(), serviceInstanceName);

        String serviceInstanceId = null;
        final RestTemplate restTemplate = new RestTemplate();
        final String uri = toscaoManagerService.getToscaoServiceUrl() + serviceInstancesPath;
        final String responseString = restTemplate.getForObject(uri, String.class);

        try {
            final List<Map<String, String>> response = mapper.readValue(responseString, List.class);

            for (final Map<String, String> instance : response) {
                final ServiceInstance serviceInstance = new ObjectMapper().readValue(mapper.writeValueAsString(instance), ServiceInstance.class);
                if (serviceInstanceName.equals(serviceInstance.getName())) {
                    serviceInstanceId = serviceInstance.getId();
                    LOG.debug("getServiceInstanceIdForName() found service instance id: {} for service instance name: {}", serviceInstanceId, serviceInstanceName);
                    break;
                }
            }

        } catch (final IOException e) {
            LOG.error("getServiceInstanceIdForName() error: ", e);
        }

        return serviceInstanceId;
    }

    private ServiceInstanceDetail getServiceInstanceDetail(final String serviceInstanceId) {
        LOG.info("getServiceInstanceDetail() using toscaoService @ {} Service instance id: {}", toscaoManagerService.getToscaoServiceUrl(), serviceInstanceId);
        ServiceInstanceDetail serviceInstanceDetail = null;
        final RestTemplate restTemplate = new RestTemplate();
        final String uri = toscaoManagerService.getToscaoServiceUrl() + serviceInstancesPath + "/" + serviceInstanceId;
        final String responseString = restTemplate.getForObject(uri, String.class);
        try {
            serviceInstanceDetail = mapper.readValue(responseString, ServiceInstanceDetail.class);

        } catch (final IOException e) {
            LOG.error("findAll() error: ", e);
        }
        return serviceInstanceDetail;
    }

}
