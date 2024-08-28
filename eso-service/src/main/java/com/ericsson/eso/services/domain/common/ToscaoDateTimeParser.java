package com.ericsson.eso.services.domain.common;

import java.util.Date;
import java.util.List;
import java.sql.Timestamp;

public final class ToscaoDateTimeParser {
	public static final String getLatestDateTime(List<String> dateTimes) {
		Timestamp latestDate = null;
		if (dateTimes.size() > 0) {
			if (dateTimes.size() > 1) {
				for (String dateTime : dateTimes) {
					Timestamp date = Timestamp.valueOf(dateTime);
					if ((null == latestDate) || (date.after(latestDate))) {
						latestDate = date;
					}
				}
				return latestDate.toString();
			} else {
				return dateTimes.get(0);
			}
		} else {
			return "";
		}
	}
}
