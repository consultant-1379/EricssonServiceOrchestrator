import json
import logging
import os
from threading import Thread

from toscao import toscaoclient
from toscao import subOrchestratorProxy

import blueprints
import uiconfig
from config import DEPLOYMENTS_FILE
from esoRestExceptions import DeploymentDoesNotExistError, DeploymentAlreadyExistsError, BlueprintDoesNotExistError
from model import Deployment, NodeInstance, ExecutionState

LOGGER = logging.getLogger('EsoService')

_deployments = {}   # pylint: disable=C0103

if os.path.exists(DEPLOYMENTS_FILE):
    with open(DEPLOYMENTS_FILE, 'r') as deployments_file:
        _deployments = json.load(deployments_file)  # pylint: disable=C0103


def ls():
    return _deployments


def get(deployment_name):
    LOGGER.info("get() deployment %s from deploymentst %s", deployment_name, _deployments)
    if deployment_name not in _deployments:
        raise DeploymentDoesNotExistError(deployment_name)
    return Deployment(**_deployments[deployment_name])


def create(deployment_name, blueprint_name, blueprint_inputs, workflow_name=None, workflow_inputs=None):
    LOGGER.info("Creating deployment %s for blueprint %s", deployment_name, blueprint_name)

    #if blueprint_name not in blueprints.ls():
    #    raise BlueprintDoesNotExistError(blueprint_name)

    if deployment_name in _deployments:
        raise DeploymentAlreadyExistsError(deployment_name)

    deployment = Deployment(deployment_name, blueprint_name)

    toscaoclient.create_service(blueprint_name, deployment_name, blueprint_inputs)

    _save(deployment)

    if workflow_name:
        thread = Thread(target=_execute_workflow, name='Execute_workflow_' + workflow_name, args=(workflow_name, deployment, workflow_inputs))
        thread.start()


def execute_workflow(deployment_name, workflow_name, workflow_inputs=None):
    LOGGER.info("Executing workflow %s with inputs %s for deployment %s", workflow_name, workflow_inputs, deployment_name)
    deployment = get(deployment_name)

    thread = Thread(target=_execute_workflow, name='Execute_workflow_' + workflow_name, args=(workflow_name, deployment, workflow_inputs))
    thread.start()


def delete(deployment_name):
    LOGGER.info("Deleting the deployment: %s", deployment_name)
    deployment = get(deployment_name)
    def _delete_deployment():
        try:
            if deployment_name in toscaoclient.get_service_names():
                _execute_workflow("uninstall", deployment)
                toscaoclient.delete_service(deployment_name)
            _delete(deployment_name)
        except Exception:
            LOGGER.exception("uninstall workflow failed for deployment %s", deployment_name)

    thread = Thread(target=_delete_deployment, name='Delete_' + deployment_name)
    thread.start()


def details(deployment_name):
    deployment = get(deployment_name)

    result = deployment.__dict__.copy()
    result['deployment_id'] = deployment.name

    outputs_data = toscaoclient.get_outputs(deployment_name)
    result["outputs"] = outputs_data

    #nodes_data = toscaoclient.get_nodes(deployment_name)
    nodes_data = subOrchestratorProxy.get_nodes(deployment_name)
    last_executed_workflow_name = deployment.executed_workflows[-1]['workflow_name'] if deployment.executed_workflows else ''
    deployment_inputs = toscaoclient.get_service_inputs(deployment_name)
    node_instances = [NodeInstance(node, deployment_inputs, last_executed_workflow_name).get_as_dict() for node in nodes_data]
    result['nodes'] = node_instances

    def _process_last_workflow_progress(deployment, node_instances):
        num_node_instances = len(node_instances)
        if deployment.executed_workflows and num_node_instances:
            last_executed_workflow = deployment.executed_workflows[-1]
            if last_executed_workflow['execution_state'] == ExecutionState.IN_PROGRESS:
                workflow_name = last_executed_workflow['workflow_name']
                if workflow_name == 'install' or workflow_name == 'uninstall':
                    last_executed_workflow['status'] = sum(node['progress'] for node in node_instances) / num_node_instances

    _process_last_workflow_progress(deployment, node_instances)

    LOGGER.debug(("Returning deployment details for deployment: %s containing %s nodes. Summary - {}", deployment_name, len(node_instances), result))
    ui_config_details = uiconfig.get_ui_configuration(deployment_name, deployment.blueprint_id)
    result = dict(result.items() + ui_config_details.items())
    return result


def outputs(deployment_name):
    LOGGER.info("Getting outputs for deployment %s", deployment_name)
    deployment = get(deployment_name)
    return toscaoclient.get_outputs(deployment.name)


def get_log(deployment_name, workflow_name):
    deployment = get(deployment_name)
    return toscaoclient.get_workflow_log(deployment.name, workflow_name)


def _execute_workflow(workflow_name, deployment, workflow_inputs=None):
    LOGGER.info("Execute workflow %s for deployment %s", workflow_name, deployment.name)
    deployment.workflow_started(workflow_name)
    _save(deployment)
    try:
        toscaoclient.execute_worflow(workflow_name, deployment.name, workflow_inputs)
        deployment.workflow_finished_successfully()
        _save(deployment)
    except Exception as exception:
        LOGGER.error("Error executing workflow %s for deployment %s", workflow_name, deployment.name)
        deployment.workflow_finished_with_error(str(exception))
        _save(deployment)
        raise exception


def _save(deployment):
    _deployments[deployment.name] = deployment.__dict__
    with open(DEPLOYMENTS_FILE, 'w') as f:
        json.dump(_deployments, f, sort_keys=True, indent=4, separators=(',', ': '))


def _delete(deployment_name):
    del _deployments[deployment_name]
    with open(DEPLOYMENTS_FILE, 'w') as f:
        json.dump(_deployments, f, sort_keys=True, indent=4, separators=(',', ': '))
