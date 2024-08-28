# Spring Boot "Microservice" ESO Service Project

Build the microservice jar:

EricssonServiceOrchestrator/eso-service> mvn clean package

You may need to increase this in docker fo rthe data lake (ADP logging):
docker-machine ssh default
sudo sysctl -w vm.max_map_count=262144


Run the cocker-compose file to start the required containers:

EricssonServiceOrchestrator/>docker-compose up



Here are some endpoints you can call where {docker_ip} is the address of your docker machine:

### Get information about system health, configurations, etc.

```
http://{docker_ip}:8091/env
http://{docker_ip}:8091/health
http://{docker_ip}:8091/info
http://{docker_ip}:8091/metrics
```

### Retrieve a list of service instances

```
GET http://{docker_ip}:8090/eso-service/v1/service-instances
Response: HTTP 200
Content-Type: application/json
[
	{
		"serviceInstanceName": "test_one",
		"initializationTime": "2018-01-04 13:54:10.562176",
		"serviceModelName": "nslcm-model",
		"inputs": null,
		"lastExecutedWorkflow": {
			"workflowName": "install",
			"startDateTime": "2018-01-04 13:56:20.395135",
			"endDateTime": "2018-01-04 13:56:43.935173",
			"status": "succeeded",
			"executionState": "",
			"errorDetails": ""
		}
	},
	{
		"serviceInstanceName": "test-2",
		"initializationTime": "2018-01-08 11:18:14.279456",
		"serviceModelName": "nslcm-model",
		"inputs": null,
		"lastExecutedWorkflow": null
	}
]
	

Also supported:
POST http://{docker_ip}:8090/eso-service/v1/service-instances
GET http://{docker_ip}:8090/eso-service/v1/service-instances/{serviceInstanceId}
DEETE http://{docker_ip}:8090/eso-service/v1/service-instances/{serviceInstanceId}

POST http://{docker_ip}:8090/eso-service/v1/service-models
GET http://{docker_ip}:8090/eso-service/v1/service-models
GET http://{docker_ip}:8090/eso-service/v1/service-models/{serviceModelId}
DELTE http://{docker_ip}:8090/eso-service/v1/service-models/{serviceModelId}


ADP Logging:
get status:
GET http://{docker_ip}:5080/log/api/v1/health

get logs (find index first with):
GET http://{docker_ip}:9200/_cat/indices?v

then e.g.:
GET http://{docker_ip}:9200/auditlogs-2018.02.06/_search


# About Spring Boot

Spring Boot is an "opinionated" application bootstrapping framework that makes it easy to create new RESTful services (among other types of applications). It provides many of the usual Spring facilities that can be configured easily usually without any XML. In addition to easy set up of Spring Controllers, Spring Data, etc. Spring Boot comes with the Actuator module that gives the application the following endpoints helpful in monitoring and operating the service:

**/metrics** Shows “metrics” information for the current application.

**/health** Shows application health information.

**/info** Displays arbitrary application info.

**/configprops** Displays a collated list of all @ConfigurationProperties.

**/mappings** Displays a collated list of all @RequestMapping paths.

**/beans** Displays a complete list of all the Spring Beans in your application.

**/env** Exposes properties from Spring’s ConfigurableEnvironment.

**/trace** Displays trace information (by default the last few HTTP requests).


# Running ESO-Service Project using Docker(Make sure "Dockerfile" has been added to your project)


**/--(Inside Dockerfile)---> 
FROM java:8 (required version). 
EXPOSE container listens on this port at runtime.
ADD ["<src>","<dest>"], copies new files URLs from <src> and adds them to the file system of the container at the path <dest>.
ENTRYPOINT allows to configure a container that will run as an executable.
**/<------------------------

**/ Dependency to be added to pom.xml or check if not available(do not add version attribute)
<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-tomcat</artifactId>
			<scope>provided</scope>
</dependency>

<dependency>
			<groupId>org.apache.tomcat.embed</groupId>
			<artifactId>tomcat-embed-jasper</artifactId>
</dependency>

**/ Within build tag of pom.xml include 
	<finalName>SpringDocker</finalName>  this matches the src folder in ADD command within Dockerfile
	
**/in pom.xml convert packaging into jar(able to run maven) . Feel free to test war.
<version>0.1.0-SNAPSHOT</version>
<packaging>jar</packaging>


**/ Commands to run on docker (tool for windows and mac) CLI
---->navigate to your project folder
---->mvn clean
---->mvn install
---->docker build -f <Dockerfile name> -t <Docker image name> "."
---->docker images (to check if image is created)
----> docker run -p <publish exposed port>(8080:8080) <docker-image>(springdocker)
---->docker-machine ls (to get the ip address of the docker machine)

**/ Reference: https://spring.io/guides/gs/spring-boot-docker/#initial

--Finally run on postman(any tool of your choice) to check for response (IPs provided on top)--