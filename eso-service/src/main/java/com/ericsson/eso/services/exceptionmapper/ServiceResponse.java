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

import com.fasterxml.jackson.annotation.*;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

/**
 * Represents A service Response. Contains the data that is returned to the UI
 *
 * @author ekeejos
 * 
 * @param <T>
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class ServiceResponse<T> {

    public ServiceResponse() {
    }

    public ServiceResponse(final T data) {
        this();
        this.data = data;
    }

    @JsonProperty("data")
    private T data;

    @JsonInclude(Include.NON_NULL)
    private ResponseError error;

    public T getData() {
        return data;
    }

    public void setData(final T data) {
        this.data = data;
    }

    public ResponseError getError() {
        return error;
    }

    public void setError(final ResponseError error) {
        this.error = error;
    }

    public class ResponseError {

        private String message;

        private String cause;

        private String stackTrace;

        public String getMessage() {
            return message;
        }

        public void setMessage(final String message) {
            this.message = message;
        }

        public void setCause(final Throwable cause) {
        	if(null != cause && null != cause.getCause()) {
        		this.cause = cause.getCause().toString();
        	}
        }

        public void setStacktrace(final StackTraceElement[] stackTrace) {
        	if(null != stackTrace && stackTrace.length > 0) {
        		this.stackTrace = stackTrace.toString();
        	}
        }
    }
}
