package com.ericsson.eso.services.domain.plugins;

import static org.junit.Assert.*;

import org.junit.BeforeClass;
import org.junit.Test;

public class TestPluginDetail {

	private static PluginDetail pluginDetail;

	@BeforeClass
	public static void test_SetupPluginDetail() {
		pluginDetail = new PluginDetail();
		pluginDetail.setPlugin_name("sample");
		pluginDetail.setUpload_time("22:22");
		pluginDetail.setVersion("1.0");
	}

	@Test
	public void test_getPlugin_name() {
		assertEquals("sample", pluginDetail.getPlugin_name());
	}

	@Test
	public void test_getUpload_time() {
		assertEquals("22:22", pluginDetail.getUpload_time());
	}

	@Test
	public void test_getVersion() {
		assertEquals("1.0", pluginDetail.getVersion());
	}
}
