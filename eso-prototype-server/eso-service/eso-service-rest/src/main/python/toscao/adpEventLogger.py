import toscaoconfig
import os
import requests
import httplib
import json
import datetime
import logging

ADP_LOG_URL = os.environ['HOST'] + ':' + os.environ['ADP_LOG_PORT'] \
              + toscaoconfig.ADP_BASE_URL + toscaoconfig.ADP_API_VERSION

EVENTS_URL = ADP_LOG_URL + toscaoconfig.ADP_EVENTS

HEALTH_URL = ADP_LOG_URL + toscaoconfig.ADP_HEALTH

LOGGER = logging.getLogger('EsoService')


def log_event(message, level):
    if(service_ok):
        payload = {
          "logPlane": "auditlogs",
          "events": [{
              "message"  : message,
              "level"    : level,
              "source"   : "1.1.1.2",
              "sourceSyntax" : "Uuid",
              "date" : str(datetime.datetime.now())
            }]
        }
        headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
        try:
            response = requests.post(EVENTS_URL, data=json.dumps(payload),headers=headers)
            LOGGER.info('Logged event ok to: %s, response: %s', EVENTS_URL, response)
        except requests.exceptions as e:
            LOGGER.error('Could not log event, error: %s', e)
    else:
        LOGGER.error('Could not log event, ADP logging service not available at: %s', ADP_LOG_URL)


def service_ok():
    response = requests.post(HEALTH_URL)
    return (httplib.OK == response) and ('green' == json.loads(response.text).get('status'))

