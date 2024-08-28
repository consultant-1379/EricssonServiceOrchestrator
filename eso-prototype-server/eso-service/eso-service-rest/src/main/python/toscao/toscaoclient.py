import logging

import executions
import servicemodel
import serviceinstance
import plugins

import toscaoconfig

import os

LOGGER = logging.getLogger('EsoService')
BASE_URL = os.environ['HOST'] + ':' + os.environ['TOSCAO_PORT'] + toscaoconfig.TOSCAO_BASE_URL + toscaoconfig.TOSCAO_API_VERSION


def get_plugins():
    stored_plugins = plugins.get_plugins(BASE_URL)
    LOGGER.debug("Found %s plugins - %s", len(stored_plugins), stored_plugins)
    return stored_plugins

def load_plugin(file):
    result = plugins.add_plugin(BASE_URL, file)
    LOGGER.debug("Loaded plugin from file: - %s", file)
    return result

def delete_plugin(plugin_name, plugin_version):
    result = plugins.delete_plugin_version(BASE_URL, plugin_name, plugin_version)
    LOGGER.debug("Deleted plugin:- %s : %s", plugin_name, plugin_version)
    return result

def get_service_names():
    service_names = []
    stored_services = serviceinstance.get_service_instances(BASE_URL)
    for service in stored_services:
        service_names.append(service['name'])
    LOGGER.debug("Found %s services - %s", len(service_names), service_names)
    return service_names

def get_service_template(service_model_id):
    LOGGER.info('get_service_template() Retrieving service template for service model id: %s', service_model_id)
    service_template= servicemodel.get_service_model(BASE_URL, service_model_id)
    LOGGER.info("get_service_template() Found service template: %s", service_template)
    return service_template

def get_service_model_id_for_name(service_model_name):
    service_model_id = ''
    LOGGER.info('get_service_model_id_for_name() Retrieve service model id for: %s', service_model_name)
    stored_service_templates = servicemodel.get_service_models(BASE_URL)
    for service_template in stored_service_templates:
        if service_model_name == service_template['name']:
            service_model_id =  service_template['id']
            break

    LOGGER.info("Found service model id: %s for service model name: %s", service_model_id, service_model_name)
    return service_model_id

def get_service_instance_id_for_name(service_instance_name):
    LOGGER.info('get_service_instance_id_for_name() Retrieve service instance id for: %s', service_instance_name)
    #TODO maybe get this from inventory to save a rest call
    stored_service_instances = serviceinstance.get_service_instances(BASE_URL)
    service_instance_id=''
    for service_instance in stored_service_instances:
        if service_instance_name == service_instance['name']:
            service_instance_id =  service_instance['id']
            break

    LOGGER.info("Found service instance id: %s for service name: %s", service_instance_id, service_instance_name)
    return service_instance_id

def get_service_models():
    LOGGER.info('get_service_models() Retrieving service models')
    stored_service_templates = servicemodel.get_service_models(BASE_URL)
    LOGGER.info("get_service_models() Found %s service models - %s", len(stored_service_templates), stored_service_templates)
    return stored_service_templates

def get_service_template_names():
    LOGGER.info('get_service_template_names() Retrieving service template names')
    stored_service_templates = servicemodel.get_service_models(BASE_URL)
    LOGGER.info("get_service_template_names() Found service templates: %s", stored_service_templates)
    service_templates = []
    for service_template in stored_service_templates:
        service_templates.append(service_template['name'])

    LOGGER.info("get_service_template_names() Found %s service templates - %s", len(service_templates), service_templates)
    return service_templates

def get_service_template_inputs(service_model_name):
    LOGGER.info('Retrieving inputs for service template %s', service_model_name)
    service_model_id = get_service_model_id_for_name(service_model_name)
    service_model = servicemodel.get_service_model(BASE_URL, service_model_id)
    service_inputs = service_model['topology']['inputs']
    inputs = {}
    for _input in service_inputs:
        default = ''
        if _input['value'] != None:
            default =_input['value']

        inputs[_input['name']] = {"default" : default,
                              "description": '',
                              "type": _input['type'],
                              "required": ''}

    LOGGER.info("Inputs for service template %s - %s", service_model_name, inputs)
    return inputs

def get_service_inputs(service_name):
    pass

def get_service_template_workflows(service_template_name):
    pass

def create_service_model(service_model_name, service_template_file):
    return servicemodel.post_service_model(BASE_URL, service_template_file, service_model_name)

def delete_service_model(service_model_name):
    service_model_id = get_service_model_id_for_name(service_model_name)
    if(service_model_id):
        return servicemodel.delete_service_model(BASE_URL, service_model_id)
    else:
        return ("Service model: %s not found.", service_model_name)

def create_service(service_model_name, service_instance_name, inputs):
    LOGGER.info('create_service() Creating service instance: %s from service model: %s', service_instance_name, service_model_name)

    service_model_id = get_service_model_id_for_name(service_model_name)
    serviceinstance.post_service_instance(BASE_URL, service_model_id, service_instance_name, inputs)
    LOGGER.info('create_service() Created service instance: %s', service_instance_name)

def delete_service(service_name):
    LOGGER.info("Deleting service %s", service_name)
    try:
        service_instance_id = get_service_instance_id_for_name(service_name)
        service = serviceinstance.get_service_instance(BASE_URL, service_instance_id)
        if service != None:
            LOGGER.info("Found service name %s for id=%s", service_name, service_instance_id)
            serviceinstance.delete_service_instance(BASE_URL, service_instance_id)
            LOGGER.info("Deleted service %s", service_name)
        else :
            LOGGER.info("Service %s does not exist: error %s", service_name, e)
    except Exception as e:
        LOGGER.info("Service %s does not exist: error %s", service_name, e)

def execute_worflow(workflow_name, service_name, inputs):
    LOGGER.info('execute_worflow() Going to execute workflow: %s, for service %s, with inputs: %s', workflow_name, service_name, inputs)
    service_instance_id = get_service_instance_id_for_name(service_name)
    executions.post_workflow_execution(BASE_URL, service_instance_id, workflow_name, inputs)
    LOGGER.info('execute_worflow() Executed workflow: %s, for service: %s', workflow_name, service_name)

def get_outputs(service_name):
    pass

def get_nodes(service_instance_name):
    #TODO - move to services.py
    LOGGER.info('Retrieving nodes for service %s', service_instance_name)
    service_instance_id = get_service_instance_id_for_name(service_instance_name)
    nodes = []
    service_instance = serviceinstance.get_service_instance(BASE_URL, service_instance_id)
    LOGGER.info('Retrieved service instance %s for service %s', service_instance, service_instance_name)
    service_nodes = {}
    if None != service_instance:
        service_nodes = service_instance['topology']['nodes']
        for node in service_nodes:
            attributes = {}
            # TODO - update when TOSCAO provides attributes - not supported yet
            #for param_name, param in node.attributes.iteritems():
            #    attributes[param_name] = param.value

            relationships = []
            for relationship in node['relationship']:
                    relationships.append({"target_name": relationship['target'],
                                         "type": relationship['relationshiptype']})

            nodes.append({"id": node['name'],
                        "name": node['name'],
                        "runtime_properties": attributes,
                        "state": node['state'],
                        "relationships": relationships})
    LOGGER.debug("Found %s node instances for service %s - %s", len(nodes), service_instance_name, nodes)
    return nodes

def get_workflow_log(service_name, workflow_name):
    pass

def read_resource(resource_path):
    LOGGER.debug("read_resource() read resource: %s", resource_path)
    #TODO - not sure what to do here
    return resource_path
