package com.ericsson.eso.services.domain.plugins;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.ericsson.eso.services.ToscaoManagerService;
import com.ericsson.eso.services.api.rest.requestdata.PluginRequestData;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class PluginRepository {

	@Autowired
	private ToscaoManagerService toscaoManagerService;
	
	private final String pluginPath = "/plugins";
	private static final Logger LOG = LoggerFactory.getLogger(PluginRepository.class);
	private ObjectMapper mapper = new ObjectMapper();
	private RestTemplate restTemplate;
	
	public List<Plugin> findAll() {
		LOG.info("findALL() using toscaoService @ {}", toscaoManagerService.getToscaoServiceUrl());
		List<Plugin> pluginList = new ArrayList<Plugin>();
		RestTemplate restTemplate = new RestTemplate();
		String uri = toscaoManagerService.getToscaoServiceUrl() + pluginPath;
		String responseString = restTemplate.getForObject(uri, String.class);
		
		try {
			List<Map<String, String>> response = mapper.readValue(responseString, List.class);
			for (Map<String, String> plugin : response) {
				Plugin aPlugin = new ObjectMapper().readValue(mapper.writeValueAsString(plugin), Plugin.class);
				pluginList.add(aPlugin);
			}
			
		} catch (IOException e) {
			LOG.error("findAllPlugins error", e);
		}
		return pluginList;
	}
	
	public PluginPost create(PluginRequestData pluginRequestData) {
		
		LOG.info("create() using toscaoService @ {} Plugin: {}", toscaoManagerService.getToscaoServiceUrl(), pluginRequestData);
		
		String uri = toscaoManagerService.getToscaoServiceUrl() + pluginPath;
		File convertedFile = convertMultipartToFile(pluginRequestData.getPlugin_file());	
		
		//create an http header -> used in httyEntity creation
		HttpHeaders header = new HttpHeaders();
		header.setContentType(MediaType.MULTIPART_FORM_DATA);
		MultiValueMap<String, Object> multipartRequest = new LinkedMultiValueMap<>();
		
		
		//create an HttpEntity for the binary part
		HttpHeaders fileHeader = new HttpHeaders();
		fileHeader.setContentType(MediaType.APPLICATION_OCTET_STREAM);
		HttpEntity<FileSystemResource> filepart = new HttpEntity<>(new FileSystemResource(convertedFile), fileHeader);
		
		//put the two parts in one request
		multipartRequest.add("plugin_file",filepart);
		
		HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(multipartRequest, header);
		LOG.info("create() creating with: {} @ {}", requestEntity, uri);
		PluginPost pluginPost = getRestTemplate().postForObject(uri, requestEntity, PluginPost.class);
		LOG.info("create () created: {}", pluginPost);
		
		return pluginPost;
	}
	
	public RestTemplate getRestTemplate() {
		restTemplate = (this.restTemplate == null) ? new RestTemplate() : restTemplate;
		restTemplate.setRequestFactory(new HttpComponentsClientHttpRequestFactory());
		restTemplate.getMessageConverters().add(new MappingJackson2HttpMessageConverter());
		return restTemplate;
	}

	private File convertMultipartToFile(MultipartFile multipart) {
		
		try {
			File convertFile = new File(multipart.getOriginalFilename());
			convertFile.createNewFile();
			FileOutputStream fos = new FileOutputStream(convertFile);
			fos.write(multipart.getBytes());
			fos.close();
			LOG.info("convertMultipartToFIle(): multipart size: {}, convertFile size: {}", multipart.getSize(), convertFile.length());
			return convertFile;
			
		} catch (IOException e) {
			LOG.error("File not found", e);
			return null;
		}
	}

	public Plugin findOne(String pluginName, Double pluginVersion) {

		LOG.info("getOne() using toscaoService @ {} pluginName and pluginVersion @ {}", toscaoManagerService.getToscaoServiceUrl(), pluginName, pluginVersion);
		RestTemplate restTemplate = new RestTemplate();
		DecimalFormat decimalFormat = new DecimalFormat("#.0");
		String uri = toscaoManagerService.getToscaoServiceUrl() + pluginPath + "/" + pluginName + "/" + decimalFormat.format(pluginVersion);
		String responseString = restTemplate.getForObject(uri, String.class);
		try {
			Plugin plugin = mapper.readValue(responseString, Plugin.class);
			return plugin;
		} catch (IOException e) {
			LOG.info("findOne()", e);
			return null;
		}
	}

	public void delete(String pluginName, Double pluginVersion) {
		LOG.info("delete() using toscaoService @ {} pluginName and pluginVersion @ {}",toscaoManagerService.getToscaoServiceUrl(), pluginName, pluginVersion);
		RestTemplate restTemplate = new RestTemplate();
		DecimalFormat decimalFormat = new DecimalFormat("#.0");
		String uri = toscaoManagerService.getToscaoServiceUrl() + pluginPath + "/" + pluginName + "/" + decimalFormat.format(pluginVersion);
		restTemplate.delete(uri);
		LOG.info("delete plugin successfully!");
	}

}
