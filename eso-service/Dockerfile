FROM java:8
COPY target/com.ericsson.eso.services-0.1.0.jar /opt/ericsson/lib/
ENTRYPOINT ["/usr/bin/java"]
CMD ["-jar", "-Dtomcat.util.http.parser.HttpParser.requestTargetAllow={}", "/opt/ericsson/lib/com.ericsson.eso.services-0.1.0.jar"]
EXPOSE 8090 8091
