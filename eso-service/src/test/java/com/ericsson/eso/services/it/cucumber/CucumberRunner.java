package com.ericsson.eso.services.it.cucumber;

import org.junit.runner.RunWith;

import cucumber.api.CucumberOptions;
import cucumber.api.junit.Cucumber;

@RunWith(Cucumber.class)
@CucumberOptions(
		glue = "", 
		features = "src/main/resources/cucumber/plugin.feature"
		)
public class CucumberRunner {

}
