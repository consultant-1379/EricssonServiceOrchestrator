package com.ericsson.eso.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.support.SpringBootServletInitializer;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

import springfox.documentation.swagger2.annotations.EnableSwagger2;

/*
 * This is the main Spring Boot application class. It configures Spring Boot, JPA, Swagger
 */

@SpringBootApplication
@Configuration
@EnableSwagger2
@EnableAutoConfiguration // Sprint Boot Auto Configuration
@ComponentScan(basePackages = "com.ericsson.eso.services")
public class Application extends SpringBootServletInitializer {

    private static final Class<Application> applicationClass = Application.class;
    private static final Logger LOG = LoggerFactory.getLogger(applicationClass);

    public static void main(final String[] args) {
        LOG.info("main() application starting.");
        SpringApplication.run(applicationClass, args);
    }

    @Override
    protected SpringApplicationBuilder configure(final SpringApplicationBuilder application) {
        return application.sources(applicationClass);
    }

}
