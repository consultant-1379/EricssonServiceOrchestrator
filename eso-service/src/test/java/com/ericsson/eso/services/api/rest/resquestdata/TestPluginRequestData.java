package com.ericsson.eso.services.api.rest.resquestdata;

import static org.junit.Assert.*;

import org.junit.BeforeClass;
import org.junit.Test;
import org.springframework.web.multipart.MultipartFile;

import com.ericsson.eso.services.api.rest.requestdata.PluginRequestData;

public class TestPluginRequestData {

	private static PluginRequestData pluginRequestData;
	private static MultipartFile plugin_file;
	
	@BeforeClass
	public static void test_SetupPluginRequestData() {
		pluginRequestData = new PluginRequestData(plugin_file);
	}

	@Test
	public void test_getPlugin_file() {
		assertEquals(plugin_file, pluginRequestData.getPlugin_file());
	}
}
