import logging

from model import ServiceModel
from toscao import toscaoclient
from toscao.toscaoExceptions import BlueprintDoesNotExistError


LOGGER = logging.getLogger('EsoService')
BUILT_IN_WORKFLOWS = {"install": {}, "uninstall": {}}


def ls():
    service_model_list = []
    stored_service_models =  toscaoclient.get_service_models()
    for stored_service_model in stored_service_models:
        service_model = ServiceModel(stored_service_model['id'], stored_service_model['name'], stored_service_model['mainSTFile'], stored_service_model['creTime'], stored_service_model['description'])
        LOGGER.info("ls() adding: %s: ", service_model.__dict__)
        service_model_list.append(service_model.__dict__)
    return service_model_list

def get_service_model_names():
    return toscaoclient.get_service_template_names()

def inputs(blueprint_id):
    if blueprint_id not in toscaoclient.get_service_template_names():
        raise BlueprintDoesNotExistError(blueprint_id)
    return {"inputs": toscaoclient.get_service_template_inputs(blueprint_id)}


def get(service_model_name):
    LOGGER.info('get() Retrieve service model for: %s', service_model_name)

    if service_model_name in toscaoclient.get_service_template_names():
        service_model_id = toscaoclient.get_service_model_id_for_name(service_model_name)
        if service_model_id:
            service_model = toscaoclient.get_service_template(service_model_id)
            LOGGER.info('get() Retrieved service model: %s', service_model)
            return service_model

def load(service_model_name, file):
    return toscaoclient.create_service_model(service_model_name, file)

def delete(service_model_name):
    return toscaoclient.delete_service_model(service_model_name)

def workflows(blueprint_id):
    if blueprint_id not in toscaoclient.get_service_template_names():
        raise BlueprintDoesNotExistError(blueprint_id)
    #custom workflows not supported
    #custom_workflows = toscaoclient.get_service_template_workflows(blueprint_id)
    all_workflows = dict(BUILT_IN_WORKFLOWS)
    return all_workflows
