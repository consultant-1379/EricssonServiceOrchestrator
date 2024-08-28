package com.ericsson.eso.services.servicemanagement;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.metrics.CounterService;
import org.springframework.boot.actuate.metrics.GaugeService;
import org.springframework.stereotype.Service;

import com.ericsson.eso.services.api.rest.requestdata.ServiceModelRequestData;
import com.ericsson.eso.services.api.rest.requestdata.PaginationFilter;
import com.ericsson.eso.services.api.rest.responsedata.PaginatedServiceResponseData;
import com.ericsson.eso.services.domain.servicemodels.*;

/*
 * Sample service to demonstrate what the API would use to get things done
 */
@Service
public class ServiceModelManager {

    private static final Logger LOG = LoggerFactory.getLogger(ServiceModelManager.class);

    @Autowired
    private ServiceModelRepository serviceModelRepository;

    @Autowired
    CounterService counterService;

    @Autowired
    GaugeService gaugeService;

    public ServiceModelManager() {
    }

    public ServiceModelDetail createServiceModel(final ServiceModelRequestData serviceModelRequestData) {
        return serviceModelRepository.create(serviceModelRequestData);
    }

    public ServiceModelDetail getServiceModel(final String serviceModelId) {
        return serviceModelRepository.findOne(serviceModelId);
    }

    public void deleteServiceModel(final String serviceModelId) {
        serviceModelRepository.delete(serviceModelId);
    }

    public void deleteServiceModels(final List<String> serviceModelIds) {
        LOG.info("deleteServiceModels() delete service model ids: {},", serviceModelIds);
        serviceModelRepository.delete(serviceModelIds);
    }

    public PaginatedServiceResponseData getModels(final Integer offset, final Integer limit, final String sortAttr, final String sortDir, final PaginationFilter filterObj) {
        LOG.info("getAllServiceModels() offset={}, limit={},", offset, limit);
        final PaginatedServiceResponseData data = serviceModelRepository.findAll(offset, limit, sortAttr, sortDir, filterObj);

        return data;
    }

    public List<ServiceModel> getAllServiceModels() {
        LOG.info("getAllServiceModels()");
        return serviceModelRepository.findAll();
    }

    public List<String> getAllServiceModelIds() {

        final List<ServiceModel> pageOfServiceModels = serviceModelRepository.findAll();
        final List<String> ids = new ArrayList<>();

        for (final ServiceModel serviceModel : pageOfServiceModels) {
            ids.add(serviceModel.getId());
        }

        return ids;
    }

    public String getServiceModelNameForId(final String serviceModelId) {
        return serviceModelRepository.getServiceModelNameForId(serviceModelId);
    }
}
