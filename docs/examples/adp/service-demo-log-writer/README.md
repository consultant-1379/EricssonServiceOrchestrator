# Log writing service for tests

This service write logs to:

- stdout
- syslog
- socket

Following environment variables should be configured:

- APP_NAME - Application name
- SYSLOG_HOST - Syslog server host
- SYSLOG_PORT - Syslog server port
- SOCKET_HOST - Socket server host
- SOCKET_PORT - Socket server port

## How to build Docker image

```bash
docker build --network host -t logging-service .
```
