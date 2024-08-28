/*------------------------------------------------------------------------------
 *******************************************************************************
 * COPYRIGHT Ericsson 2018
 *
 * The copyright to the computer program(s) herein is the property of
 * Ericsson Inc. The programs may be used and/or copied only with written
 * permission from Ericsson Inc. or in accordance with the terms and
 * conditions stipulated in the agreement/contract under which the
 * program(s) have been supplied.
 *******************************************************************************
 *----------------------------------------------------------------------------*/
package com.ericsson.eso.services;

import static com.google.common.base.Predicates.or;
import static springfox.documentation.builders.PathSelectors.regex;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.google.common.base.Predicate;

import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;

/**
 * Used to configure Swagger UI.
 * 
 * @see http://localhost:8090/swagger-ui.html?baseUrl=http%3A%2F%2Flocalhost%3A8090%2Fv2%2Fapi-docs#/
 * 
 * @author ekeejos
 *
 */
@Configuration
public class WebConfiguration {

    @Value("${project.version}")
    private String version;

    @Bean
    public Docket esoApi() {
        return new Docket(DocumentationType.SWAGGER_2).apiInfo(apiInfo()).select().paths(endpointPaths()).build();
    }

    @SuppressWarnings("unchecked")
    private Predicate<String> endpointPaths() {
        return or(regex("/eso-service/v1.*"));
    }

    private ApiInfo apiInfo() {
        return new ApiInfoBuilder().title("Ericsson Service Orchestration REST API").description("Welcome to Ericsson Service Orchestration.").version(version).build();
    }

}
