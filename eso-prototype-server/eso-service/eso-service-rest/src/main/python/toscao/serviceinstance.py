import requests
import json
import logging
import httplib

import adpEventLogger


from toscaoExceptions import InternalServerException, BadRequestException, ServiceInstanceNotFoundException, ServiceInstanceActiveException

LOGGER = logging.getLogger('EsoService')

SERVICES_URL = '/service-instances'


def get_service_instances(base_url):
    services_url = base_url + SERVICES_URL
    try:
        response = requests.get(services_url)
        if response.status_code == httplib.OK:
            return json.loads(response.text)
    except requests.exceptions as e:
        raise InternalServerException(json.loads(response.text).get('message'))


def get_service_instance(base_url, service_instance_id):
    service_url = base_url + SERVICES_URL + '/' + service_instance_id
    try:
        response = requests.get(service_url)
        if response.status_code == httplib.OK:
            return json.loads(response.text)
    except requests.exceptions as e:
        raise InternalServerException(json.loads(response.text).get('message'))

def get_service_instance_nodes(base_url, service_instance_id):
    service_url = base_url + SERVICES_URL + '/' + service_instance_id
    try:
        response = requests.get(service_url)
        if response.status_code == httplib.OK:
            return json.loads(response.text)
    except requests.exceptions as e:
        raise InternalServerException(json.loads(response.text).get('message'))


def post_service_instance(base_url, service_model_id, service_instance_name, inputs=None):
    service_url = base_url + SERVICES_URL
    LOGGER.info('post_service_instance() Creating service instance: %s, from service model: %s,  inputs: %s', service_instance_name, service_model_id, inputs)

    if inputs == None:
        inputs = {}
    payload = {
        'name':service_instance_name,
        'serviceModelID':service_model_id,
        'inputs':inputs
    }
    headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
    try:
        response = requests.post(service_url, data=json.dumps(payload),headers=headers)
        LOGGER.info('post_service_instance() response: %s,  %s',response, payload)
        if response.status_code == httplib.OK:
            adpEventLogger.log_event('Created service instance: ' + service_instance_name, 'info')
            return response.text
        elif response.status_code == httplib.BAD_REQUEST:
            raise BadRequestException(json.loads(response.text).get('message'))
        elif response.status_code == httplib.CONFLICT:
            raise InternalServerException(json.loads(response.text).get('message'))
        elif response.status_code == httplib.INTERNAL_SERVER_ERROR:
            raise InternalServerException("oops, internal server error on TOSCAO")
    except requests.exceptions as e:
        raise InternalServerException(json.loads(response.text).get('message'))


def delete_service_instance(base_url, service_instance_id):
    service_url = base_url + SERVICES_URL + '/' + service_instance_id
    headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
    try:
        response = requests.delete(service_url, headers=headers)
        if response.status_code == httplib.OK:
            return response.text
        elif response.status_code == httplib.BAD_REQUEST:
            raise BadRequestException(json.loads(response.text).get('message'))
        elif response.status_code == httplib.NOT_FOUND:
            raise ServiceInstanceNotFoundException(json.loads(response.text).get('message'))
        elif response.status_code == httplib.CONFLICT:
            raise ServiceInstanceActiveException(json.loads(response.text).get('message'))
    except requests.exceptions.HTTPError as e:
        print(e)
    except requests.exceptions.ConnectionError as e:
        print(e)
    except requests.exceptions.ConnectTimeout as e:
        print(e)

def print_services(base_url):
    print('\nServices')
    print('========')
    json_data = get_service_instances(base_url)
    if json_data is not None:
        for i in range(len(json_data)):
            print ('\nName: {0}').format(json_data[i].get('name'))
            print ('Service Model Id: {0}').format(json_data[i].get('serviceModelID'))
            print ('Service Instance Id: {0}').format(json_data[i].get('id'))
    else:
        print('No services loaded...')

def print_response(response):
    print('Status Code: {0}, Text:{1}'.format(response.status_code, response.text))