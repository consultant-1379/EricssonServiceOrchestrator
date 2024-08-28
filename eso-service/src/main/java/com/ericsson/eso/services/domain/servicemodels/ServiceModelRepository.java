package com.ericsson.eso.services.domain.servicemodels;

import java.io.*;
import java.util.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.http.converter.*;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.ericsson.eso.services.ToscaoManagerService;
import com.ericsson.eso.services.api.rest.requestdata.PaginationFilter;
import com.ericsson.eso.services.api.rest.requestdata.ServiceModelRequestData;
import com.ericsson.eso.services.api.rest.responsedata.*;
import com.ericsson.eso.services.exception.ResourceConflictException;
import com.ericsson.eso.services.sort.PaginationUtil;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ServiceModelRepository {
    @Autowired
    private ToscaoManagerService toscaoManagerService;

    @Autowired
    private ApiResponseRender apiResponseRender;

    @Autowired
    RestTemplateAdapter restTemplateAdapter;

    private final String serviceModelsPath = "/service-models";

    private static final Logger LOG = LoggerFactory.getLogger(ServiceModelRepository.class);

    private final ObjectMapper mapper = new ObjectMapper();

    public List<ServiceModel> findAll() {
        LOG.info("findAll() using toscaoService @{}", toscaoManagerService.getToscaoServiceUrl());
        final List<ServiceModel> serviceModelList = new ArrayList<>();

        try {
            final String uri = toscaoManagerService.getToscaoServiceUrl() + serviceModelsPath;
            final String responseString = restTemplateAdapter.getStringForObject(uri);

            final List<Map<String, String>> response = mapper.readValue(responseString, List.class);

            for (final Map<String, String> model : response) {
                final ServiceModel serviceModel = new ObjectMapper().readValue(mapper.writeValueAsString(model), ServiceModel.class);
                serviceModelList.add(serviceModel);
            }

        } catch (final IOException e) {
            LOG.error("findAll() error: ", e);
        }
        return serviceModelList;
    }

    public PaginatedServiceResponseData findAll(final Integer offset, final Integer limit, final String sortAttr, final String sortDir, final PaginationFilter filterObj) {
        LOG.info("findAll() using toscaoService @{}, offset: {}, limit: {}, sortAttr: {}, sortDir: {}, filter: {}", toscaoManagerService.getToscaoServiceUrl(), offset, limit, sortAttr, sortDir,
                filterObj);
        final List<ServiceModel> allModels = findAll();
        final List<ServiceModelResponseData> convertedModels = apiResponseRender.convertServiceModelList(allModels);

        final List<ServiceModelResponseData> filteredModels = PaginationUtil.filter(convertedModels, filterObj);
        final List<ServiceModelResponseData> sortedModels = PaginationUtil.sort(filteredModels, sortAttr, sortDir);
        final List<ServiceModelResponseData> paginatedModels = PaginationUtil.batch(sortedModels, offset, limit);

        final PaginatedServiceResponseData data = new PaginatedServiceResponseData();
        data.setTotal(filteredModels.size());
        data.setItems(paginatedModels);

        return data;
    }

    public void delete(final String serviceModelId) {
        LOG.info("delete() using toscaoService @ {} Service Model id: {}", toscaoManagerService.getToscaoServiceUrl(), serviceModelId);
        if (null != serviceModelId) {
            final RestTemplate restTemplate = new RestTemplate();
            final String uri = toscaoManagerService.getToscaoServiceUrl() + serviceModelsPath + "/" + serviceModelId;
            try {
                restTemplate.delete(uri);
            } catch (final RestClientException e) {
                // TODO - proper handling
                throw new ResourceConflictException("Service Model could not be deleted.");
            }
        }
    }

    public void delete(final List<String> serviceModelIds) {
        LOG.info("delete() using toscaoService @ {} Service Model id: {}", toscaoManagerService.getToscaoServiceUrl(), serviceModelIds);
        for (final String serviceModelId : serviceModelIds) {
            this.delete(serviceModelId);
        }
    }

    public ServiceModelDetail create(final ServiceModelRequestData serviceModelRequestData) {
        LOG.info("create() using toscaoService @ {} Service model: {}", toscaoManagerService.getToscaoServiceUrl(), serviceModelRequestData);

        final String uri = toscaoManagerService.getToscaoServiceUrl() + serviceModelsPath;

        final File convertedFile = convertMultipartToFile(serviceModelRequestData.getFile());

        final ArrayList<HttpMessageConverter<?>> converters = new ArrayList<HttpMessageConverter<?>>(
                Arrays.asList(new FormHttpMessageConverter(), new MappingJackson2HttpMessageConverter(), new ResourceHttpMessageConverter()));
        final RestTemplate restTemplate = new RestTemplate(converters);
        final HttpHeaders header = new HttpHeaders();
        header.setContentType(MediaType.MULTIPART_FORM_DATA);
        final MultiValueMap<String, Object> multipartRequest = new LinkedMultiValueMap<>();

        // creating an HttpEntity for the JSON part
        final HttpHeaders jsonHeader = new HttpHeaders();
        jsonHeader.setContentType(MediaType.TEXT_PLAIN);
        final HttpEntity<String> jsonHttpEntity = new HttpEntity<>(serviceModelRequestData.getName(), jsonHeader);
        // creating an HttpEntity for the binary part
        final HttpHeaders fileHeader = new HttpHeaders();
        fileHeader.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        final HttpEntity<FileSystemResource> filePart = new HttpEntity<>(new FileSystemResource(convertedFile), fileHeader);
        // putting the two parts in one request
        multipartRequest.add("name", jsonHttpEntity);
        multipartRequest.add("file", filePart);

        final HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(multipartRequest, header);
        LOG.info("create() creating with: {} @ {}", requestEntity, uri);

        final ServiceModelDetail serviceModelDetail = restTemplate.postForObject(uri, requestEntity, ServiceModelDetail.class);

        LOG.info("create() created: {}", serviceModelDetail);

        return serviceModelDetail;
    }

    public ServiceModelDetail findOne(final String serviceModelId) {
        LOG.info("findOne() using toscaoService @ {} Service Model Id: {}", toscaoManagerService.getToscaoServiceUrl(), serviceModelId);
        if (null != serviceModelId) {
            return getServiceModelDetail(serviceModelId);
        } else {
            return null;
        }
    }

    public String getServiceModelNameForId(final String serviceModelId) {
        LOG.info("getServiceModelName() using toscaoService @{} get service model name for {}", toscaoManagerService.getToscaoServiceUrl(), serviceModelId);

        String serviceModelName = "";
        final RestTemplate restTemplate = new RestTemplate();

        final String uri = toscaoManagerService.getToscaoServiceUrl() + serviceModelsPath + "/" + serviceModelId;
        final String responseString = restTemplate.getForObject(uri, String.class);
        try {
            final ServiceModelDetail serviceModelDetail = mapper.readValue(responseString, ServiceModelDetail.class);
            if (null != serviceModelDetail) {
                serviceModelName = serviceModelDetail.getName();
            }

        } catch (final IOException e) {
            LOG.error("findAll() error: ", e);
        }
        LOG.info("getServiceModelName() returning service model name {} for {}", serviceModelName, serviceModelId);
        return serviceModelName;
    }

    private String getServiceModelIdForName(final String serviceModelName) {
        LOG.info("getServiceModelIdForName() using toscaoService @ {} Service Model name: {}", toscaoManagerService.getToscaoServiceUrl(), serviceModelName);

        String serviceModelId = null;
        final RestTemplate restTemplate = new RestTemplate();
        final String uri = toscaoManagerService.getToscaoServiceUrl() + serviceModelsPath;
        final String responseString = restTemplate.getForObject(uri, String.class);

        try {
            final List<Map<String, String>> response = mapper.readValue(responseString, List.class);

            for (final Map<String, String> model : response) {
                final ServiceModel serviceModel = new ObjectMapper().readValue(mapper.writeValueAsString(model), ServiceModel.class);
                if (serviceModelName.equals(serviceModel.getName())) {
                    serviceModelId = serviceModel.getId();
                    LOG.debug("getServiceModelIdForName() found service Model id: {} for service Model name: {}", serviceModelId, serviceModelName);
                    break;
                }
            }

        } catch (final IOException e) {
            LOG.error("getServiceModelIdForName() error: ", e);
        }

        return serviceModelId;
    }

    private ServiceModelDetail getServiceModelDetail(final String serviceModelId) {
        LOG.info("getServiceModelDetail() using toscaoService @ {} Service Model id: {}", toscaoManagerService.getToscaoServiceUrl(), serviceModelId);
        ServiceModelDetail serviceModelDetail = null;
        final RestTemplate restTemplate = new RestTemplate();
        final String uri = toscaoManagerService.getToscaoServiceUrl() + serviceModelsPath + "/" + serviceModelId;
        final String responseString = restTemplate.getForObject(uri, String.class);

        try {
            serviceModelDetail = mapper.readValue(responseString, ServiceModelDetail.class);

        } catch (final IOException e) {
            LOG.error("findAll() error: ", e);
        }
        return serviceModelDetail;
    }

    private File convertMultipartToFile(final MultipartFile multipart) {
        try {
            final File convFile = new File(multipart.getOriginalFilename());
            convFile.createNewFile();
            final FileOutputStream fos = new FileOutputStream(convFile);
            fos.write(multipart.getBytes());
            fos.close();
            LOG.info("convertMultipartToFile(): multipart size: {}, convFile size: {}", multipart.getSize(), convFile.length());
            return convFile;
        } catch (IllegalStateException | IOException e) {
            // TODO this should be handled better
            LOG.error("File not found", e);
            return null;
        }
    }

}
