package com.ericsson.eso.services.api.rest.responsedata;

import java.util.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.ericsson.eso.services.domain.common.Input;
import com.ericsson.eso.services.domain.plugins.Plugin;
import com.ericsson.eso.services.domain.plugins.PluginDetail;
import com.ericsson.eso.services.domain.serviceexecutions.ServiceExecution;
import com.ericsson.eso.services.domain.serviceinstances.ServiceInstance;
import com.ericsson.eso.services.domain.servicemodels.ServiceModel;

@Service
public class ApiResponseRender {

    private static final Logger LOG = LoggerFactory.getLogger(ApiResponseRender.class);

    public List<ServiceInstanceResponseData> convertServiceInstanceList(final List<ServiceInstance> serviceInstanceList) {
        LOG.info("convertServiceInstanceList(): {}", serviceInstanceList);
        final List<ServiceInstanceResponseData> serviceInstanceDataList = new ArrayList<>();
        for (final ServiceInstance serviceInstance : serviceInstanceList) {
            serviceInstanceDataList.add(convertServiceInstance(serviceInstance));
        }
        Collections.sort(serviceInstanceDataList);
        return serviceInstanceDataList;
    }

    public ServiceInstanceResponseData convertServiceInstance(final ServiceInstance serviceInstance) {
        LOG.info("convertServiceInstance(): {}", serviceInstance);

        final ServiceInstanceResponseData serviceInstanceData = new ServiceInstanceResponseData();
        serviceInstanceData.setServiceInstanceName(serviceInstance.getName());
        serviceInstanceData.setServiceInstanceId(serviceInstance.getId());
        serviceInstanceData.setServiceModelName(serviceInstance.getServiceModelName());
        serviceInstanceData.setInitializationTime(serviceInstance.getCreTime());

        serviceInstanceData.setInitializationTime(serviceInstance.getCreTime());
        serviceInstanceData.setInputs(serviceInstance.getInputs());
        serviceInstanceData.setLastExecutedWorkflow(convertServiceExecution(serviceInstance.getLastServiceExecution()));

        LOG.info("converted(): {}", serviceInstance);
        return serviceInstanceData;
    }

    public ExecutedWorkflowData convertServiceExecution(final ServiceExecution serviceExecution) {
        LOG.info("convertServiceExecution(): {}", serviceExecution);
        if (null != serviceExecution) {
            final ExecutedWorkflowData executedWorkflowData = new ExecutedWorkflowData();
            executedWorkflowData.setEndDateTime(serviceExecution.getEndtime());
            executedWorkflowData.setStartDateTime(serviceExecution.getStarttime());
            executedWorkflowData.setStatus(2);
            executedWorkflowData.setWorkflowName(serviceExecution.getWorkflow());
            executedWorkflowData.setErrorDetails("");
            executedWorkflowData.setExecutionState(0);
            LOG.info("converted(): {}", executedWorkflowData);
            return executedWorkflowData;

        } else {
            return null;
        }
    }

    public List<ServiceModelResponseData> convertServiceModelList(final List<ServiceModel> serviceModelList) {
        LOG.info("convertServiceModelList(): {}", serviceModelList);
        final List<ServiceModelResponseData> serviceModelDataList = new ArrayList<>();
        for (final ServiceModel serviceModel : serviceModelList) {
            serviceModelDataList.add(convertServiceModel(serviceModel));
        }
        return serviceModelDataList;
    }

    public ServiceModelResponseData convertServiceModel(final ServiceModel serviceModel) {
        LOG.info("convertServiceModel(): {}", serviceModel);

        final ServiceModelResponseData serviceModelData = new ServiceModelResponseData();
        serviceModelData.setId(serviceModel.getId());
        serviceModelData.setName(serviceModel.getName());
        serviceModelData.setService_template_file_name(serviceModel.getMainSTFile());
        serviceModelData.setUpload_time(serviceModel.getCreTime());
        serviceModelData.setDescription(serviceModel.getDescription());

        LOG.info("converted(): {}", serviceModel);
        return serviceModelData;
    }

    public List<PluginDetail> convertPluginList(final List<Plugin> pluginList) {
        LOG.info("convertPluginList() list of plugins: {}", pluginList);
        final List<PluginDetail> pluginDataList = new ArrayList<>();
        for (final Plugin plugin : pluginList) {
            pluginDataList.add(convertPlugin(plugin));
        }

        return pluginDataList;
    }

    public PluginDetail convertPlugin(final Plugin plugin) {
        LOG.info("convertPlugin() plugin: {}", plugin);
        final PluginDetail pluginDetail = new PluginDetail();
        pluginDetail.setPlugin_name(plugin.getName());
        pluginDetail.setUpload_time(plugin.getUploadTime());
        pluginDetail.setVersion(plugin.getVersion());

        LOG.info("convertPlugin(): converted to: {}", pluginDetail);
        return pluginDetail;
    }

    public List<String> convertPluginListToIdsList(final List<Plugin> pluginList) {
        LOG.info("convertPluginListToIdsList() pluginlist: {}", pluginList);
        final List<String> idLIst = new ArrayList<>();
        for (final Plugin plugin : pluginList) {
            idLIst.add(convertPlugin(plugin).getId());
        }
        LOG.info("convertPluginListToIdsList() returning idLIst: {}", idLIst);
        return idLIst;
    }

    public static List<ServiceModelInputsResponseData> convertInputs(final List<Input> inputs) {
        final List<ServiceModelInputsResponseData> convertedList = new ArrayList<>();
        for (final Input input : inputs) {
            convertedList.add(convertInput(input));
        }
        return convertedList;
    }

    public static ServiceModelInputsResponseData convertInput(final Input input) {
        final ServiceModelInputsResponseData serviceModelInputsResponseData = new ServiceModelInputsResponseData();
        serviceModelInputsResponseData.setName(input.getName());
        serviceModelInputsResponseData.setType(input.getType());
        serviceModelInputsResponseData.setDescription("");
        if (null != input.getValue()) {
            serviceModelInputsResponseData.setDefaultValue(input.getValue());
        } else {
            serviceModelInputsResponseData.setDefaultValue("");
        }
        return serviceModelInputsResponseData;
    }
}
