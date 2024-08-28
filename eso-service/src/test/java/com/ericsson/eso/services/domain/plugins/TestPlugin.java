package com.ericsson.eso.services.domain.plugins;

import static org.junit.Assert.*;

import org.junit.BeforeClass;
import org.junit.Test;

public class TestPlugin {

	private static Plugin plugin;

	@BeforeClass
	public static void test_SetupPlugin() {
		plugin=new Plugin();
		plugin.setName("sample");
		plugin.setUploadTime("22:22");
		plugin.setVersion("1.0");
	}
	
	@Test
	public void test_getName() {
		assertEquals("sample", plugin.getName());
	}
	
	@Test 
	public void test_getUploadTime() {
		assertEquals("22:22", plugin.getUploadTime());
	}
	
	@Test
	public void test_getVersion() {
		assertEquals("1.0", plugin.getVersion());
	}
}
