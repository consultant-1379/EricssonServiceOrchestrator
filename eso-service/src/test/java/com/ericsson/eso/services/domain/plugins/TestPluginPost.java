package com.ericsson.eso.services.domain.plugins;

import static org.junit.Assert.*;

import org.junit.BeforeClass;
import org.junit.Test;

public class TestPluginPost {
	
	private static PluginPost pluginPost;
	
	@BeforeClass
	public static void test_SetUpPluginPost() {
		pluginPost = new PluginPost();
		pluginPost.setMessage("hello world!");
	}
	
	@Test
	public void test_getMessage() {
		assertEquals("hello world!", pluginPost.getMessage().toString());
	}

}
