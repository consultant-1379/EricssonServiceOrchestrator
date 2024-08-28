package com.ericsson.eso.services.api.rest;

import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.ApplicationEventPublisherAware;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.WebRequest;

import com.ericsson.eso.services.domain.RestErrorInfo;
import com.ericsson.eso.services.exception.*;

/**
 * This class is meant to be extended by all REST resource "controllers". It contains exception mapping and other common REST API functionality
 */
//@ControllerAdvice?
public abstract class AbstractRestHandler implements ApplicationEventPublisherAware {

    protected final Logger LOG = LoggerFactory.getLogger(this.getClass());
    protected ApplicationEventPublisher eventPublisher;

    protected static final String DEFAULT_PAGE_LIMIT = "100";
    protected static final String DEFAULT_PAGE_OFFSET = "0";
    protected static final String DEFAULT_SORT_ATTR = "name";
    protected static final String DEFAULT_SORT_DIR = "asc";
    protected static final String DEFAULT_FILTER = "";

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(DataFormatException.class)
    public @ResponseBody RestErrorInfo handleDataStoreException(final DataFormatException ex, final WebRequest request, final HttpServletResponse response) {
        LOG.info("Converting Data Store exception to RestResponse : " + ex.getMessage());

        return new RestErrorInfo(ex, "You messed up.");
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ExceptionHandler(ResourceNotFoundException.class)
    public @ResponseBody RestErrorInfo handleResourceNotFoundException(final ResourceNotFoundException ex, final WebRequest request, final HttpServletResponse response) {
        LOG.info("ResourceNotFoundException handler:" + ex.getMessage());

        return new RestErrorInfo(ex, "Request could not be accepted.");
    }

    @ResponseStatus(HttpStatus.CONFLICT)
    @ExceptionHandler(ResourceConflictException.class)
    public @ResponseBody RestErrorInfo handleResourceConflictException(final ResourceConflictException ex, final WebRequest request, final HttpServletResponse response) {
        LOG.info("ResourceConflictException handler:" + ex.getMessage());

        return new RestErrorInfo(ex, "Request could not be accepted.");
    }

    @Override
    public void setApplicationEventPublisher(final ApplicationEventPublisher applicationEventPublisher) {
        this.eventPublisher = applicationEventPublisher;
    }

    //todo: replace with exception mapping
    public static <T> T checkResourceFound(final T resource) {
        if (resource == null) {
            throw new ResourceNotFoundException("Resource was not found.");
        }
        return resource;
    }

}