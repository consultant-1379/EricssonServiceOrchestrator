package com.ericsson.eso.services.api.rest.responsedata;

import static org.junit.Assert.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.joda.time.DateTime;
import org.junit.Test;

import com.ericsson.eso.services.domain.plugins.Plugin;
import com.ericsson.eso.services.domain.plugins.PluginDetail;
import com.ericsson.eso.services.domain.serviceinstances.ServiceInstance;


public class ApiRenderTest {

	private static final String CREATED_TIME = "Monday 13:13";
	private static final String ID = "aesr-sjnler-sklkre";
	private static final String NAME = "Service Instance One";
	private static final String SERVICE_MODEL_ID = "kjhd-4kjl4k3-4445453";
	private static final String SERVICE_MODEL_NAME = "Service Model One";
	
	private static final String ID2 = "abcdefg-123456789";
	private static final String UPLOAD_TIME = "Monday 22:22";
	private static final String VERSION = "1.0";
	private static final String PLUGIN_NAME = "test_plugin";
	private static final List<PluginDetail> ITEM = new ArrayList<>();
	private static final Integer TOTAL = 5001;

//	@Test
//	public void givenPlugin_whenConvertToPluginDetail_thenIDSetOk() {
//		ApiResponseRender apiResponseRender = new ApiResponseRender();
//		Plugin plugin = givenPlugin();
//		PluginDetail pluginDetail = apiResponseRender.convertPlugin(plugin);
//		assertTrue(pluginDetail.getId().equals(ID));
//	}

	@Test
	public void givenPlugin_whenConvertToPluginDetail_thenUploadtimeSetOk() {
		ApiResponseRender apiResponseRender = new ApiResponseRender();
		Plugin plugin = givenPlugin();
		PluginDetail pluginDetail = apiResponseRender.convertPlugin(plugin);
		assertTrue(pluginDetail.getUpload_time().equals(UPLOAD_TIME));
	}

	@Test
	public void givenPlugin_whenConvertToPluginDetail_thenVersionSetOk() {
		ApiResponseRender apiResponseRender = new ApiResponseRender();
		Plugin plugin = givenPlugin();
		PluginDetail pluginDetail = apiResponseRender.convertPlugin(plugin);
		assertTrue(pluginDetail.getVersion().equals(VERSION));
	}

	@Test
	public void givenPlugin_whenConvertToPluginDetail_thenPluginnameSetOk() {
		ApiResponseRender apiResponseRender = new ApiResponseRender();
		Plugin plugin = givenPlugin();
		PluginDetail pluginDetail = apiResponseRender.convertPlugin(plugin);
		assertTrue(pluginDetail.getPlugin_name().equals(PLUGIN_NAME));
	}

	@Test
	public void givenPluginData_thenSetItemOk() {
		ApiResponseRender apiResponseRender = new ApiResponseRender();
		List<PluginDataList> pluginDataList = givenPluginData();
		assertTrue(pluginDataList.get(0).getItems().equals(ITEM));
	}

	@Test
	public void givnPluginlist_whenConvertToPlugindata_thenTotalSetOk() {
		ApiResponseRender apiResponseRender = new ApiResponseRender();
		List<PluginDataList> pluginDataList = givenPluginData();
		assertTrue(pluginDataList.get(0).getTotal().equals(TOTAL));
	}

	
	private List<PluginDataList> givenPluginData() {
		List<PluginDataList> pluginDataList = new ArrayList<PluginDataList>();
		PluginDataList pluginData = new PluginDataList();
		pluginData.setItems(ITEM);
		pluginData.setTotal(TOTAL);
		pluginDataList.add(pluginData);
		return pluginDataList;
	}


	@Test
	public void givenServiceInstance_whenConvert_thenInitializationTimeSetOk() {
		ApiResponseRender apiRender = new ApiResponseRender();
		ServiceInstance serviceInstance = givenServiceInstance();
		ServiceInstanceResponseData serviceInstanceData = apiRender.convertServiceInstance(serviceInstance);
		assertTrue(serviceInstanceData.getInitializationTime().equals(CREATED_TIME));
	}
	
	@Test
	public void givenServiceInstance_whenConvert_thenServiceOnstanceNameSetOk() {
		ApiResponseRender apiRender = new ApiResponseRender();
		ServiceInstance serviceInstance = givenServiceInstance();
		ServiceInstanceResponseData serviceInstanceData = apiRender.convertServiceInstance(serviceInstance);
		assertTrue(serviceInstanceData.getServiceInstanceName().equals(NAME));
	}
	
	
	private ServiceInstance givenServiceInstance() {
		ServiceInstance serviceInstance = new ServiceInstance();
		serviceInstance.setCreTime(CREATED_TIME);
		serviceInstance.setInputs(new HashMap<>());
		serviceInstance.setId(ID);
		serviceInstance.setLastServiceExecution(null);
		serviceInstance.setName(NAME);
		serviceInstance.setServiceModelID(SERVICE_MODEL_ID);
		serviceInstance.setServiceModelName(SERVICE_MODEL_NAME);
		return serviceInstance;
	}
	
	private static Plugin givenPlugin() {
		Plugin plugin = new Plugin();
		plugin.setName(PLUGIN_NAME);
		plugin.setUploadTime(UPLOAD_TIME);
		plugin.setVersion(VERSION);
		return plugin;
	}

	private PluginDetail givenPluginDetail(Plugin plugin) {
		PluginDetail pluginDetail = new PluginDetail();
		pluginDetail.setPlugin_name(plugin.getName());
		pluginDetail.setUpload_time(plugin.getUploadTime());
		pluginDetail.setVersion(plugin.getVersion());
		return pluginDetail;
	}
	


}
