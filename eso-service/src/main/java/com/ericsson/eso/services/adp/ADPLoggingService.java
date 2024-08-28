package com.ericsson.eso.services.adp;

import java.util.Arrays;

import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.ericsson.eso.services.adp.logging.AdpLoggingEvent;
import com.ericsson.eso.services.adp.logging.AdpLoggingRequest;
import com.ericsson.eso.services.adp.logging.AdploggingHealth;


@Service
public class ADPLoggingService {
	
	private static final String VERSION = "/log/api/v1";
	private static final String EVENTS = "/events";
	private static final String HEALTH = "/health";
	
	@Value("${ADP_LOG_HOST}")
	private String adpLoggingServiceHost;
	
	@Value("${ADP_LOG_PORT}")
	private String adpLoggingServicePort;
	
    private static final Logger LOG = LoggerFactory.getLogger(ADPLoggingService.class);
	private static final String GREEN = "green";
	private static final String SOURCE = "ESO";
	private static final String SOURCE_SYNTAX = "Uuid";
	private static final String AUDIT_LOGS_LOGPLANE = "auditlogs";

	
	public void logEvent(String message, String level) {
		if(isServiceOk()) {
			LOG.info("logEvent() logging message: {}, level: {}", message, level);
			RestTemplate restTemplate = new RestTemplate();
			AdpLoggingEvent adpLoggingEvent= new AdpLoggingEvent();
			AdpLoggingRequest adpLoggingRequest= new AdpLoggingRequest();
			
			adpLoggingEvent.setMessage(message);
			adpLoggingEvent.setLevel(level);
			adpLoggingEvent.setDate(DateTime.now().toString());
			
			adpLoggingEvent.setSource(SOURCE);
			adpLoggingEvent.setSourceSyntax(SOURCE_SYNTAX);
			
			adpLoggingRequest.setLogPlane(AUDIT_LOGS_LOGPLANE);
			adpLoggingRequest.setEvents(Arrays.asList(adpLoggingEvent));

			restTemplate.postForObject(getLoggingServiceEventsUrl(), adpLoggingRequest, String.class);
			LOG.info("logEvent() logged message ok");
		} else {
			LOG.info("logEvent() failed to log message: {}, level: {}, logging service not available", message, level);
		}
	}
	
	private boolean isServiceOk() {
		RestTemplate restTemplate = new RestTemplate();
		try {
			AdploggingHealth health = restTemplate.getForObject(getLoggingServiceHealthUrl(), AdploggingHealth.class);
			return health.getStatus().equalsIgnoreCase(GREEN);

		} catch (Exception e) {
			LOG.error("isServiceOk() error: ", e);
			return false;
		}
		
	}
	
	private String getLoggingServiceEventsUrl() {
		return adpLoggingServiceHost + ":" + adpLoggingServicePort + VERSION + EVENTS;
	}
	
	private String getLoggingServiceHealthUrl() {
		return adpLoggingServiceHost + ":" + adpLoggingServicePort + VERSION + HEALTH;
	}

}
