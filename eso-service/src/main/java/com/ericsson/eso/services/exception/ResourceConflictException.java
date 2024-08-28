package com.ericsson.eso.services.exception;

/**
 * For HTTP 409 errros
 */
public class ResourceConflictException extends RuntimeException {
    public ResourceConflictException() {
        super();
    }

    public ResourceConflictException(String message, Throwable cause) {
        super(message, cause);
    }

    public ResourceConflictException(String message) {
        super(message);
    }

    public ResourceConflictException(Throwable cause) {
        super(cause);
    }

}
