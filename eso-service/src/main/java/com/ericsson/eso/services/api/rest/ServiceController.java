package com.ericsson.eso.services.api.rest;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.ericsson.eso.services.adp.ADPLoggingService;
import com.ericsson.eso.services.api.rest.requestdata.*;
import com.ericsson.eso.services.api.rest.responsedata.*;
import com.ericsson.eso.services.domain.plugins.*;
import com.ericsson.eso.services.domain.serviceinstances.ServiceInstance;
import com.ericsson.eso.services.domain.serviceinstances.ServiceInstanceDetail;
import com.ericsson.eso.services.domain.servicemodels.ServiceModelDetail;
import com.ericsson.eso.services.exception.DataFormatException;
import com.ericsson.eso.services.servicemanagement.ServiceInstanceManager;
import com.ericsson.eso.services.servicemanagement.ServiceModelManager;

import io.swagger.annotations.*;

/*
 * Demonstrates how to set up RESTful API end points using Spring MVC
 */
@CrossOrigin(origins = "*")
@RestController
@RequestMapping(value = "/eso-service/v1")
@Api(tags = { "serviceinstances" })
public class ServiceController extends AbstractRestHandler {

    private static final String DEFAULT_OFFSET = "0";
    private static final String DEFAULT_LIMIT = "0";
    private static final String DEFAULT_SORT_DIR = "asc";
    private static final String NO_FILTER = "{}";

    @Autowired
    private ServiceInstanceManager serviceInstanceManager;

    @Autowired
    private ServiceModelManager serviceModelManager;

    @Autowired
    private ApiResponseRender apiResponseRender;

    @Autowired
    private ApiRequestRender apiRequestRender;

    @Autowired
    private PluginRepository pluginRepository;

    @Autowired
    private ADPLoggingService aDPLoggingService;

    @RequestMapping(value = "/service-models", method = RequestMethod.POST, consumes = { "multipart/form-data" }, produces = { "application/json", "application/xml" })
    @ResponseStatus(HttpStatus.CREATED)
    @ApiOperation(value = "Create a service model.", notes = "Returns the URL of the new resource in the Location header.")
    public ServiceModelDetail createServiceModel(@RequestParam("name") final String name, @RequestParam(name = "description", required = false) final String description,
            @RequestParam("file") final MultipartFile file, final HttpServletRequest request, final HttpServletResponse response) {
        final ServiceModelRequestData serviceModelRequestData = new ServiceModelRequestData(name, file, description);
        final ServiceModelDetail createdServiceModel = serviceModelManager.createServiceModel(serviceModelRequestData);
        // TODO - implement error handling, e.g failure to create service model

        //TODO Just for testing... implement a better way
        aDPLoggingService.logEvent("Loaded service model: '" + createdServiceModel.getName() + "' ok.", "info");
        return createdServiceModel;
    }

    @RequestMapping(value = "/service-models", method = RequestMethod.GET, produces = { "application/json", "application/xml" })
    @ResponseStatus(HttpStatus.OK)
    @ApiOperation(value = "Get a paginated list of all service models.", notes = "The list is paginated. You can provide an offset (default 0) and a limit (default 100)")
    public @ResponseBody PaginatedServiceResponseData getPaginatedServiceModels(
            @ApiParam(value = "The offset (zero-based)", required = true) @RequestParam(value = "offset", required = true, defaultValue = DEFAULT_PAGE_OFFSET) final Integer offest,
            @ApiParam(value = "The limit", required = true) @RequestParam(value = "limit", required = true, defaultValue = DEFAULT_PAGE_LIMIT) final Integer limit,
            @ApiParam(value = "The sortAttr", required = true) @RequestParam(value = "sortAttr", required = true, defaultValue = DEFAULT_SORT_ATTR) final String sortAttr,
            @ApiParam(value = "The sortDir", required = true) @RequestParam(value = "sortDir", required = true, defaultValue = DEFAULT_SORT_DIR) final String sortDir,
            @ApiParam(value = "The filter", required = true) @RequestParam(value = "filters", required = true, defaultValue = DEFAULT_FILTER) final String filter, final HttpServletRequest request,
            final HttpServletResponse response) {

        final PaginationFilter filterObj = new PaginationFilter(filter);
        final PaginatedServiceResponseData serviceModelList = serviceModelManager.getModels(offest, limit, sortAttr, sortDir, filterObj);
        return serviceModelList;
    }

    @RequestMapping(value = "/service-model-ids", method = RequestMethod.GET, produces = { "application/json", "application/xml" })
    @ResponseStatus(HttpStatus.OK)
    @ApiOperation(value = "Get a paginated list of all service model IDs.", notes = "This is used for paginated grid")
    public @ResponseBody List<String> getAllServiceModelIds(final HttpServletRequest request, final HttpServletResponse response) {
        final List<String> serviceModelList = serviceModelManager.getAllServiceModelIds();
        return serviceModelList;
    }

    @RequestMapping(value = "/service-models/{serviceModelId}", method = RequestMethod.GET, produces = { "application/json", "application/xml" })
    @ResponseStatus(HttpStatus.OK)
    @ApiOperation(value = "Get a single service model.", notes = "You have to provide a valid service model ID.")
    public @ResponseBody ServiceModelDetail getServiceModel(@ApiParam(value = "The ID of the service model=.", required = true) @PathVariable("serviceModelId") final String serviceModelId,
            final HttpServletRequest request, final HttpServletResponse response) throws Exception {
        final ServiceModelDetail serviceModelDetail = serviceModelManager.getServiceModel(serviceModelId);
        checkResourceFound(serviceModelDetail);
        // TODO - render this to what the NBI exposes
        return serviceModelDetail;
    }

    @RequestMapping(value = "/service-models/{serviceModelId}/inputs", method = RequestMethod.GET, produces = { "application/json", "application/xml" })
    @ResponseStatus(HttpStatus.OK)
    @ApiOperation(value = "Get a single service model inputs.", notes = "You have to provide a valid service model ID.")
    public @ResponseBody List<ServiceModelInputsResponseData> getServiceModelInputs(
            @ApiParam(value = "The ID of the service model=.", required = true) @PathVariable("serviceModelId") final String serviceModelId, final HttpServletRequest request,
            final HttpServletResponse response) throws Exception {
        final ServiceModelDetail serviceModelDetail = serviceModelManager.getServiceModel(serviceModelId);
        checkResourceFound(serviceModelDetail);
        // TODO - render this to what the NBI exposes
        return ApiResponseRender.convertInputs(serviceModelDetail.getTopology().getInputs());
    }

    @RequestMapping(value = "/service-models/{serviceModelId}", method = RequestMethod.DELETE, produces = { "application/json", "application/xml" })
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @ApiOperation(value = "Delete a service model resource.", notes = "You have to provide a valid service model ID in the URL. Once deleted the resource can not be recovered.")
    public void deleteServiceModel(@ApiParam(value = "The Id of the existing service model resources.", required = true) @PathVariable("serviceModelId") final String serviceModelId,
            final HttpServletRequest request, final HttpServletResponse response) {
        checkResourceFound(serviceModelManager.getServiceModel(serviceModelId));
        serviceModelManager.deleteServiceModel(serviceModelId);
    }

    @RequestMapping(value = "/service-models", method = RequestMethod.DELETE, consumes = { "application/json" }, produces = { "application/json", })
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @ApiOperation(value = "Delete service model resources.", notes = "You have to provide valid service model IDs. Once deleted the resource cannot be recovered.")
    public void deleteServiceModels(@RequestBody final ArrayList<String> serviceModelIds, final HttpServletRequest request, final HttpServletResponse response) {
        LOG.info("deleteServiceModels() delete service model ids: {}}", serviceModelIds);

        if (!serviceModelIds.isEmpty()) {
            for (final String serviceModelId : serviceModelIds) {
                checkResourceFound(serviceModelManager.getServiceModel(serviceModelId));
            }
            serviceModelManager.deleteServiceModels(serviceModelIds);
        }
    }

    @RequestMapping(value = "/service-instances", method = RequestMethod.POST, consumes = { "application/json", "application/xml" }, produces = { "application/json", "application/xml" })
    @ResponseStatus(HttpStatus.CREATED)
    @ApiOperation(value = "Create a service instance.", notes = "Returns the URL of the new resource in the Location header.")
    public ServiceInstanceDetail createServiceInstance(@RequestBody final ServiceInstanceRequest serviceInstanceRequest, final HttpServletRequest request, final HttpServletResponse response) {
        final ServiceInstanceDetail createdServiceInstance = serviceInstanceManager.createServiceInstance(apiRequestRender.convertServiceInstanceRequest(serviceInstanceRequest), true);
        return createdServiceInstance;
    }

    @RequestMapping(value = "/service-instances", method = RequestMethod.GET, produces = { "application/json", "application/xml" })
    @ResponseStatus(HttpStatus.OK)
    @ApiOperation(value = "Get a paginated list of all service instances.", notes = "The list is paginated. You can provide a page number (default 0) and a page size (default 100)")
    public @ResponseBody List<ServiceInstanceResponseData> getAllServiceInstances(final HttpServletRequest request, final HttpServletResponse response) {
        final List<ServiceInstance> serviceInstanceList = serviceInstanceManager.getAllServiceInstances();
        return apiResponseRender.convertServiceInstanceList(serviceInstanceList);
    }

    @RequestMapping(value = "/service-instances/{serviceInstanceId}", method = RequestMethod.GET, produces = { "application/json", "application/xml" })
    @ResponseStatus(HttpStatus.OK)
    @ApiOperation(value = "Get a single service instance.", notes = "You have to provide a valid service instance ID.")
    public @ResponseBody ServiceInstanceDetail getServiceInstance(
            @ApiParam(value = "The ID of the service instance=.", required = true) @PathVariable("serviceInstanceId") final String serviceInstanceId, final HttpServletRequest request,
            final HttpServletResponse response) throws Exception {
        final ServiceInstanceDetail serviceInstanceDetail = serviceInstanceManager.getServiceInstance(serviceInstanceId);
        checkResourceFound(serviceInstanceDetail);
        // TODO - render this to what the NBI exposes
        return serviceInstanceDetail;
    }

    @RequestMapping(value = "/service-instances/{serviceInstanceId}", method = RequestMethod.DELETE, produces = { "application/json", "application/xml" })
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @ApiOperation(value = "Delete a service instance resource.", notes = "You have to provide a valid service instance ID in the URL. Once deleted the resource can not be recovered.")
    public void deleteServiceInstance(@ApiParam(value = "The IDs of the existing service instance resource.", required = true) @PathVariable("serviceInstanceId") final String serviceInstanceId,
            final HttpServletRequest request, final HttpServletResponse response) {
        checkResourceFound(serviceInstanceManager.getServiceInstance(serviceInstanceId));
        serviceInstanceManager.deleteServiceInstance(serviceInstanceId);
    }

    @RequestMapping(value = "/plugins", method = RequestMethod.GET, produces = { "application/json", "application/xml" })
    @ResponseStatus(HttpStatus.OK)
    @ApiOperation(value = "Get plugins.", notes = "You have to provide a plugins url.")
    public @ResponseBody PluginDataList getPlugins(
            @ApiParam(value = "The offset", required = false) @RequestParam(value = "offset", required = false, defaultValue = DEFAULT_OFFSET) final Integer offset,
            @ApiParam(value = "The limit", required = false) @RequestParam(value = "limit", required = false, defaultValue = DEFAULT_LIMIT) final Integer limit,
            @ApiParam(value = "The sort attribute", required = false) @RequestParam(value = "sortAttr", required = false) final String sortAttr,
            @ApiParam(value = "The sort direction", required = false) @RequestParam(value = "sortDir", required = false, defaultValue = DEFAULT_SORT_DIR) final String sortDir,
            @ApiParam(value = "The filters", required = false) @RequestParam(value = "filters", required = true, defaultValue = NO_FILTER) final String jsonFilter, final HttpServletRequest request,
            final HttpServletResponse response) {

        LOG.info("getPlugins(): offset:{}, limit:{}, sortAttr:{}, sortDir:{}, jsonFilter:{}", offset, limit, sortAttr, sortDir, jsonFilter);
        final List<Plugin> pluginList = pluginRepository.findAll();
        try {
            final PaginationRequest paginationRequest = new PaginationRequest(offset, limit, sortAttr, sortDir, jsonFilter);
            return paginationRequest.process(apiResponseRender.convertPluginList(pluginList));

        } catch (final Exception e) {
            LOG.error("Failed: {}", e);
            throw new DataFormatException("Failed to handle paginated request for all plugins", e);
        }
    }

    @RequestMapping(value = "/plugin-ids", method = RequestMethod.GET, produces = { "application/json", "application/xml" })
    @ResponseStatus(HttpStatus.OK)
    @ApiOperation(value = "Get all plugin ids.", notes = "You have to provide a plugins url.")
    public @ResponseBody List<String> getPluginIds(final HttpServletRequest request, final HttpServletResponse response) {
        final List<Plugin> pluginList = pluginRepository.findAll();
        return apiResponseRender.convertPluginListToIdsList(pluginList);
    }

    @RequestMapping(value = "/plugins/{pluginName}/{pluginVersion}", method = RequestMethod.GET, produces = { "application/json", "application/xml" })
    @ResponseStatus(HttpStatus.OK)
    @ApiOperation(value = "Get plugins.", notes = "You have to provide a plugin name and version.")
    public @ResponseBody PluginDetail getAPlugin(@ApiParam(value = "The name of plugin =.", required = true) @PathVariable("pluginName") final String pluginName,
            @PathVariable("pluginVersion") final Double pluginVersion, final HttpServletRequest request, final HttpServletResponse response) throws Exception {
        final Plugin plugin = pluginRepository.findOne(pluginName, pluginVersion);
        return apiResponseRender.convertPlugin(plugin);
    }

    @RequestMapping(value = "/plugins", method = RequestMethod.POST, consumes = { "multipart/form-data" }, produces = { "application/json", "application/xml" })
    @ResponseStatus(HttpStatus.CREATED)
    @ApiOperation(value = "Post Plugins", notes = "You need to provide a plugin.")
    public PluginPost createPlugin(@RequestParam("file") final MultipartFile plugin_file, final HttpServletRequest request, final HttpServletResponse response) {
        final PluginRequestData pluginRequestData = new PluginRequestData(plugin_file);
        final PluginPost createdPlugin = pluginRepository.create(pluginRequestData);
        return createdPlugin;
    }

    @RequestMapping(value = "/plugins/{pluginName}/{pluginVersion}", method = RequestMethod.DELETE, produces = { "application/json", "application/xml" })
    @ResponseStatus(HttpStatus.OK)
    @ApiOperation(value = "Delete plugins.", notes = "You have to provide a plugin name and version.")
    public void deletePlugin(@ApiParam(value = "The IDs of the existing service model resources.", required = true) @PathVariable("pluginName") final String pluginName,
            @PathVariable("pluginVersion") final Double pluginVersion, final HttpServletRequest request, final HttpServletResponse response) {
        pluginRepository.delete(pluginName, pluginVersion);
    }
}
