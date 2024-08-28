import requests
import json
import httplib
from toscaoExceptions import InternalServerException, PluginAlreadyExistsException, PluginNotFoundException, PluginInUseException, BadRequestException

PLUGINS_URL = '/plugins'


def get_plugins(base_url):
    plugin_url = base_url + PLUGINS_URL
    try:
        response = requests.get(plugin_url)
        if response.status_code == httplib.OK:
            return json.loads(response.text)
    except requests.exceptions.HTTPError as e:
        print(e)
    except requests.exceptions.ConnectionError as e:
        print(e)
    except requests.exceptions.ConnectTimeout as e:
        print(e)

def add_plugin(base_url, file):
    plugin_url = base_url + PLUGINS_URL
    multipart_form_data = {
        'plugin_file': file
    }
    try:
        response = requests.post(plugin_url,files=multipart_form_data)
        if response.status_code == httplib.OK:
            return response.text
        elif response.status_code == httplib.BAD_REQUEST:
            raise BadRequestException(json.loads(response.text).get('message'))
        elif response.status_code == httplib.CONFLICT:
            raise PluginAlreadyExistsException(json.loads(response.text).get('message'))
        elif response.status_code == httplib.INTERNAL_SERVER_ERROR:
            raise InternalServerException(json.loads(response.text).get('message'))
    except requests.exceptions.HTTPError as e:
        print(e)
    except requests.exceptions.ConnectionError as e:
        print(e)
    except requests.exceptions.ConnectTimeout as e:
        print(e)

def delete_plugin_version(base_url, name, version):
    plugin_url = base_url + PLUGINS_URL + '/' + name + '/' + version
    headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
    try:
        response = requests.delete(plugin_url, headers=headers)
        if response.status_code == httplib.OK:
            return response.text
        elif response.status_code == httplib.BAD_REQUEST:
            raise BadRequestException(json.loads(response.text).get('message'))
        elif response.status_code == httplib.NOT_FOUND:
            raise PluginNotFoundException(json.loads(response.text).get('message'))
        elif response.status_code == httplib.CONFLICT:
            raise PluginInUseException(json.loads(response.text).get('message'))
    except requests.exceptions.HTTPError as e:
        print(e)
    except requests.exceptions.ConnectionError as e:
        print(e)
    except requests.exceptions.ConnectTimeout as e:
        print(e)

def print_plugins(base_url):
    print('\nPlugins')
    print('========')
    json_data = get_plugins(base_url)
    if json_data is not None:
        for i in range(len(json_data)):
            print ('\nName: {0}').format(json_data[i].get('name'))
            print ('Version: {0}').format(json_data[i].get('version'))
    else:
        print('No plugins loaded...')

