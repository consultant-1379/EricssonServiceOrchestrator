import requests
import json
import httplib
import logging

import adpEventLogger

from  toscaoExceptions import BadRequestException, ServiceExecutionNotFoundException, InternalServerException
EXECUTION_URL = '/service-executions'
WORKFLOW_URL = '/workflow'
CANCEL_URL = '/cancel'
LOG_URL = '/log'


# Optional Logging Parameters
OFFSET = 0
LENGTH = 1000

LOGGER = logging.getLogger('EsoService')


def get_executions(base_url):
    executions_url = base_url + EXECUTION_URL
    try:
        response = requests.get(executions_url)
        if response.status_code == httplib.OK:
            return json.loads(response.text)
    except requests.exceptions.HTTPError as e:
        print(e)
    except requests.exceptions.ConnectionError as e:
        print(e)
    except requests.exceptions.ConnectTimeout as e:
        print(e)

def post_workflow_execution(base_url, service_instance_id, workflow_name, inputs=None):
    LOGGER.info('post_workflow_execution() Executed workflow: %s, for service: %s', workflow_name, service_instance_id)

    service_instance_url = base_url + EXECUTION_URL + WORKFLOW_URL
    if inputs == None:
        inputs = {}
    payload = {
        'serviceInstanceId':service_instance_id,
        'workflow':workflow_name,
        'inputs':inputs
    }
    headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
    try:
        response = requests.post(service_instance_url, data=json.dumps(payload), headers=headers)
        if response.status_code == httplib.OK:
            LOGGER.info('post_workflow_execution() Executed workflow: %s, for service: %s, response: %s', workflow_name,
                        service_instance_id, response.text)
            adpEventLogger.log_event('Executed workflow: ' + workflow_name + ' for service: ' + service_instance_id, 'info')
            return response.text
        elif response.status_code == httplib.BAD_REQUEST:
            raise BadRequestException(json.loads(response.text).get('message'))
        elif response.status_code == httplib.NOT_FOUND:
            raise ServiceExecutionNotFoundException(json.loads(response.text).get('message'))
        elif response.status_code == httplib.INTERNAL_SERVER_ERROR:
            raise InternalServerException(json.loads(response.text).get('message'))
        elif response.status_code == httplib.CONFLICT:
            raise InternalServerException(json.loads(response.text).get('message'))
    except requests.exceptions as e:
        raise InternalServerException(json.loads(response.text).get('message'))


def post_cancel_execution(base_url, execution_id):
    cancel_url = base_url + EXECUTION_URL  + '/'+ execution_id + CANCEL_URL
    headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
    try:
        response = requests.post(cancel_url, headers=headers)
        print_response(response)
    except requests.exceptions.HTTPError as e:
        print(e)
    except requests.exceptions.ConnectionError as e:
        print(e)
    except requests.exceptions.ConnectTimeout as e:
        print(e)

def print_execution_log(base_url, execution_id):
    log_url = base_url + EXECUTION_URL +  '/'+ execution_id + LOG_URL
    try:
        response = requests.get(log_url)
        if response.status_code == httplib.OK:
            print(json.dumps(response.text))
        else:
            print_response(response)
    except requests.exceptions.HTTPError as e:
        print(e)
    except requests.exceptions.ConnectionError as e:
        print(e)
    except requests.exceptions.ConnectTimeout as e:
        print(e)

def print_executions(base_url):
    print('\nExecutions')
    print('==========')
    json_data = get_executions(base_url)
    if json_data is not None:
        for i in range(len(json_data)):
            print ('\nExecution Id: {0}').format(json_data[i].get('id'))
            print ('Workflow: {0}').format(json_data[i].get('workflow'))
            print ('Status: {0}').format(json_data[i].get('status'))
            print ('Service Instance Id: {0}').format(json_data[i].get('serviceInstanceId'))
    else:
        print('No Executions loaded...')

def print_response(response):
    print('Status Code: {0}, Text:{1}'.format(response.status_code, response.text))