package com.ericsson.eso.services.api.rest.responsedata;

import java.util.EnumSet;
import java.util.HashMap;
import java.util.Map;

public enum ServiceInstanceState {
	INPROGRESS(0), SUCCEEDED(1), FAILED(2);

	private static final Map<Integer, ServiceInstanceState> lookup = new HashMap<>();

	static {
		for (ServiceInstanceState s : EnumSet.allOf(ServiceInstanceState.class))
			lookup.put(s.getCode(), s);
	}

	private int code;

	private ServiceInstanceState(int code) {
    	      this.code = code;
    	 }

	public int getCode() {
		return code;
	}

	public static ServiceInstanceState get(int code) {
		return lookup.get(code);
	}
}
