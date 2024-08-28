import requests
import json
import httplib
import logging


from toscaoExceptions import BadRequestException, InternalServerException, ServiceModelNotFoundException, ServiceModelInUseException

LOGGER = logging.getLogger('EsoService')

SERVICE_MODELS_URL = '/service-models'

def get_service_models(base_url):
    service_models_url = base_url + SERVICE_MODELS_URL
    LOGGER.info('get_service_models() Retrieving service models from: %s', service_models_url)
    try:
        response = requests.get(service_models_url)
        if response.status_code == httplib.OK:
            LOGGER.info('Got models ok...')
            return json.loads(response.text)
        else:
            LOGGER.info('Got models error %s...', response.status_code)
    except requests.exceptions as e:
        LOGGER.info('Got error...')

def get_service_model(base_url, service_model_id):
    service_models_url = base_url + SERVICE_MODELS_URL + '/' + service_model_id
    LOGGER.info('get_service_model() Retrieving service model: %s from : %s',  service_model_id, service_models_url)

    headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
    try:
        response = requests.get(service_models_url, headers=headers)
        if response.status_code == httplib.OK:
            return json.loads(response.text)
        elif response.status_code == httplib.BAD_REQUEST:
            raise BadRequestException(json.loads(response.text).get('message'))
        elif response.status_code == httplib.NOT_FOUND:
            raise ServiceModelNotFoundException(json.loads(response.text).get('message'))
        elif response.status_code == httplib.CONFLICT:
            raise ServiceModelInUseException(json.loads(response.text).get('message'))
    except requests.exceptions.HTTPError as e:
        print(e)
    except requests.exceptions.ConnectionError as e:
        print(e)
    except requests.exceptions.ConnectTimeout as e:
        print(e)


def post_service_model(base_url, model_file, service_name):
    service_models_url = base_url + SERVICE_MODELS_URL
    multipart_form_data = {
        'file': open(model_file.filename, 'rb')
    }
    payload = {
        'name': service_name
    }
    try:
        response = requests.post(service_models_url,files=multipart_form_data, data=payload)
        if response.status_code == httplib.OK:
            return response.text
        elif response.status_code == httplib.BAD_REQUEST:
            raise BadRequestException(json.loads(response.text).get('message'))
        elif response.status_code == httplib.INTERNAL_SERVER_ERROR:
            raise InternalServerException(json.loads(response.text).get('message'))
        elif response.status_code == httplib.CONFLICT:
            raise ServiceModelInUseException(json.loads(response.text).get('message'))
    except requests.exceptions.HTTPError as e:
        print(e)
    except requests.exceptions.ConnectionError as e:
        print(e)
    except requests.exceptions.ConnectTimeout as e:
        print(e)


def delete_service_model(base_url, service_model_id):
    service_models_url = base_url + SERVICE_MODELS_URL + '/' + service_model_id
    headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
    try:
        response = requests.delete(service_models_url, headers=headers)
        if response.status_code == httplib.OK:
            return response.text
        elif response.status_code == httplib.BAD_REQUEST:
            raise BadRequestException(json.loads(response.text).get('message'))
        elif response.status_code == httplib.NOT_FOUND:
            raise ServiceModelNotFoundException(json.loads(response.text).get('message'))
        elif response.status_code == httplib.CONFLICT:
            raise ServiceModelInUseException(json.loads(response.text).get('message'))
    except requests.exceptions.HTTPError as e:
        print(e)
    except requests.exceptions.ConnectionError as e:
        print(e)
    except requests.exceptions.ConnectTimeout as e:
        print(e)

