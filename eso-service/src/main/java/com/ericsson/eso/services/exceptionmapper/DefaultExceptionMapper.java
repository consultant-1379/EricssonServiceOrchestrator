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

package com.ericsson.eso.services.exceptionmapper;

import static org.springframework.http.ResponseEntity.status;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class DefaultExceptionMapper {

    private final Logger logger = LoggerFactory.getLogger(getClass());

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ServiceResponse<Object>> defaultErrorHandler(final HttpServletRequest req, final Exception e) throws Exception {
        logger.error(e.getMessage(), e);
        return status(500).body(getResponseError(e));
    }

    private ServiceResponse<Object> getResponseError(final Exception e) {
        final ServiceResponse<Object> serviceResponse = new ServiceResponse<Object>();
        serviceResponse.setError(serviceResponse.new ResponseError());
        serviceResponse.getError().setMessage(e.getMessage());
        serviceResponse.getError().setCause(e.getCause());
        serviceResponse.getError().setStacktrace(e.getStackTrace());
        return serviceResponse;
    }
}
