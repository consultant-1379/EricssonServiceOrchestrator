import logging
from logging.handlers import RotatingFileHandler
from threading import current_thread

from flask import Flask, request, jsonify, flash, redirect
from flask_cors import CORS

import blueprints
import deployments
import plugins

import json
from toscao import adpEventLogger

from config import ESO_SERVICE_LOG_FILE

from esoRestExceptions import DeploymentAlreadyExistsError, BlueprintDoesNotExistError, InvalidNameError,DeploymentDoesNotExistError

app = Flask(__name__, static_url_path='')  # pylint: disable=C0103
CORS(app)

LOGGER = logging.getLogger('EsoService')
LOG_LEVEL = logging.DEBUG
ONE_HUNDRED_MB = 100 * 1024 * 1024

@app.after_request
def after_request(response):
  response.headers.add('Access-Control-Allow-Origin', '*')
  response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  return response

def _setup_logging():
    hdlr = RotatingFileHandler(ESO_SERVICE_LOG_FILE, maxBytes=ONE_HUNDRED_MB, backupCount=9)
    formatter = logging.Formatter('%(asctime)s %(levelname)s [%(threadName)s] %(filename)s - %(message)s')
    hdlr.setFormatter(formatter)
    LOGGER.addHandler(hdlr)
    LOGGER.setLevel(LOG_LEVEL)

    ch = logging.StreamHandler()
    ch.setLevel(logging.ERROR)
    # create formatter and add it to the handlers
    formatter = logging.Formatter('%(asctime)s %(levelname)s [%(threadName)s] %(filename)s - %(message)s')
    ch.setFormatter(formatter)
    # add the handlers to the logger
    LOGGER.addHandler(ch)


_setup_logging()


@app.teardown_appcontext
def shutdown_session(exception=None):
    if exception:
        LOGGER.warn('Error during session shutdown - %s', exception)

@app.route('/eso-services')
def home():
    return 'Hello! from Ericsson Service Orchestrator'

@app.route('/eso-services/plugins', methods=['GET'])
def list_plugins():
    """ Returns all plugins
        The following information is returned
        [
            {
                "id": "b265ae7bb21742398c86198433db13cf",
                "plugin_name": "nslcm_plugin",
                "upload_time": "2017-12-19 10:26:01.312331",
                "version": "1.0"
            },
            {
                "id": "b265ae7bb2178908c86198433536672f",
                "plugin_name": "other_plugin",
                "upload_time": "2017-12-19 10:26:01.312331",
                "version": "3.0"
            }
        ]
    """
    LOGGER.info("Requested to get all plugins")
    thread_name = current_thread().getName()
    try:
        current_thread().setName(thread_name + ":list_plugins")
        return jsonify(plugins.ls())
    finally:
        current_thread().setName(thread_name)

@app.route('/eso-services/plugins', methods=['POST'])
def post_plugin():
    # check if the post request has the file part
    if 'plugin_file' not in request.files:
        flash('No file part')
        return redirect(request.url)
    file = request.files['plugin_file']
    LOGGER.info("Requested to post plugin file: %s", file)

    thread_name = current_thread().getName()
    try:
        current_thread().setName(thread_name + ":post_plugin")
        return jsonify(plugins.load_plugin(file))
    finally:
        current_thread().setName(thread_name)

@app.route('/eso-services/plugins/<plugin_name>/<plugin_version>', methods=['DELETE'])
def delete_plugin(plugin_name, plugin_version):

    LOGGER.info("Requested to delete plugin:- %s : %s", plugin_name, plugin_version)

    thread_name = current_thread().getName()
    try:
        current_thread().setName(thread_name + ":delete_plugin")
        return jsonify(plugins.delete(plugin_name, plugin_version))
    finally:
        current_thread().setName(thread_name)

@app.route('/eso-services/service-models', methods=['GET'])
def list_service_models():
    """ Returns all plugins
        The following information is returned
        [
          {
            "description": null,
            "id": "081a7fea-d142-4b26-9f6c-3da2cd29e82d",
            "name": "nslcm_1",
            "service_template_file_name": "nslcm2.yaml",
            "upload_time": "2017-12-19 13:55:19.672621"
          },
                    {
            "description": null,
            "id": "081a7fea-d142-4b26-9f6c-3daaaa29e82d",
            "name": "nslcm_1",
            "service_template_file_name": "nslcm2.yaml",
            "upload_time": "2017-12-19 14:55:49.672661"
          }
        ]
    """
    LOGGER.info("Requested to get all servicemodels")
    thread_name = current_thread().getName()
    try:
        current_thread().setName(thread_name + ":get_servicemodels")
        return jsonify(blueprints.ls())
    finally:
        current_thread().setName(thread_name)


@app.route('/eso-services/service-models', methods=['POST'])
def post_service_model():
    # check if the post request has the file part
    if 'file' not in request.files:
        flash('No file part')
        return redirect(request.url)
    file = request.files['file']
    file.save(file.filename)

    service_model_name = request.form.get('name')
    LOGGER.info("Requested to create service-model: %s from file: %s", service_model_name, file)

    thread_name = current_thread().getName()
    try:
        current_thread().setName(thread_name + ":post_service-model")
        return jsonify(blueprints.load(service_model_name, file))
    finally:
        current_thread().setName(thread_name)

@app.route('/eso-services/service-models/<service_model_name>', methods=['DELETE'])
def delete_service_model(service_model_name):

    LOGGER.info("Requested to delete service_model_name:- %s", service_model_name)

    thread_name = current_thread().getName()
    try:
        current_thread().setName(thread_name + ":delete_plugin")
        return jsonify(blueprints.delete(service_model_name))
    finally:
        current_thread().setName(thread_name)

@app.route('/eso-services/service-models/<service_model_name>', methods=['GET'])
def get_service_model(service_model_name):

    LOGGER.info("Requested to get service_model_name:- %s", service_model_name)

    thread_name = current_thread().getName()
    try:
        current_thread().setName(thread_name + ":get_plugin")
        service_model = blueprints.get(service_model_name)
        if service_model:
            return jsonify(service_model)
        else:
            LOGGER.error("Requested to get service_model_name error:- %s", service_model_name)
            return json.dumps({'message': 'Service model ' + service_model_name + ' does not exist'}), 404, {'ContentType': 'application/json'}
            #return Response("{'message': 'Service model does not exist1'}", httplib.NOT_FOUND, mimetype='application/json' )
    finally:
        current_thread().setName(thread_name)

@app.route('/eso-services/blueprints', methods=['GET'])
def list_blueprints():
    """ Returns all blueprints
        The following information is returned
        {
            "blueprints": [
                "blueprint_id1",
                "blueprint_id2",
                ...
            ]
        }
    """
    LOGGER.info("Requested to get all blueprints...")
    thread_name = current_thread().getName()
    try:
        current_thread().setName(thread_name + ":list_blueprints")
        return jsonify(blueprints=blueprints.get_service_model_names())
    finally:
        current_thread().setName(thread_name)


@app.route('/eso-services/blueprints/<blueprint_id>/inputs', methods=['GET'])
def get_inputs(blueprint_id):
    """ Returns blueprint inputs.
        The parameters are
            blueprint id - name identifying the blueprint
        The following information is returned
            JSON object with blueprint inputs
    """
    LOGGER.info("Requested to get inputs for blueprint: %s", blueprint_id)
    thread_name = current_thread().getName()
    try:
        current_thread().setName(thread_name + ":get_inputs")
        return jsonify(blueprints.inputs(blueprint_id))
    except BlueprintDoesNotExistError as e:
        LOGGER.error(e.message)
        return str(e), 404
    except Exception as e:
        LOGGER.exception("Error getting inputs for blueprint %s", blueprint_id)
        return str(e), 500
    finally:
        current_thread().setName(thread_name)


@app.route('/eso-services/blueprints/<blueprint_id>/workflows', methods=['GET'])
def get_workflows(blueprint_id):
    """ Returns all available workflows for the blueprint.
    The following information is returned for each workflow depending the information
    defined in the blueprint.
    <workflow name>: {
        "mapping": <path to the method implementing this workflow>
        "parameters": <map of parameters to be passed to the workflow>
            <parameter name>:
                {
                    "description": <description of the parameter>,
                    "type": <the type of the parameter>
                    "default": <the default value for the parameter>,
                }
    }
    """
    LOGGER.info("Requested to get workflows for blueprint with id %s", blueprint_id)
    thread_name = current_thread().getName()
    try:
        current_thread().setName(thread_name + ":get_workflows")
        workflows = blueprints.workflows(blueprint_id)
        LOGGER.debug("Returning workflows for blueprint %s:  %s", blueprint_id, workflows)
        return jsonify(workflows)
    except BlueprintDoesNotExistError as e:
        LOGGER.error(e.message)
        return str(e), 404
    except Exception as e:
        LOGGER.exception("Error getting workflows for blueprint %s", blueprint_id)
        return str(e), 500
    finally:
        current_thread().setName(thread_name)


@app.route('/eso-services/blueprints/<blueprint_id>', methods=['GET'])
def get_blueprint(blueprint_id):
    """ Returns blueprint yaml file in json format.
        The parameters are
            blueprint id - name identifying the blueprint
        The following information is returned
            JSON object frmo the blueprint.yaml
    """
    LOGGER.info("Requested to get the blueprint.yaml file for blueprint: %s", blueprint_id)
    thread_name = current_thread().getName()
    try:
        current_thread().setName(thread_name + ":get_blueprint")
        return jsonify(blueprints.get(blueprint_id))
    except BlueprintDoesNotExistError as e:
        LOGGER.error(e.message)
        return str(e), 404
    finally:
        current_thread().setName(thread_name)


@app.route('/eso-services/deployments', methods=['GET'])
def get_deployments():
    """ Returns all the active deployments
    The following information is returned for all the deployments
    <Deployment id>: {
        "blueprint_file": <name of blueprint yaml file>,
        "blueprint_id": <name of blueprint>,
        "error_details": <The error details for failed deployments>
        "state": <deployment state>,
        "workflow_last_executed": <name of workflow last executed>
    }
    """
    LOGGER.info("Requested to get all deployments")
    thread_name = current_thread().getName()
    try:
        current_thread().setName(thread_name + ":get_deployments")
        all_deployments = deployments.ls()
        LOGGER.info("Returning deployments:  %s", all_deployments)
        return jsonify(all_deployments)
    finally:
        current_thread().setName(thread_name)


@app.route('/eso-services/deployments/<deployment_id>', methods=['POST'])
def create_deployment(deployment_id):
    """ Creates a deployment.
    The parameters are
        - deployment_id - unique name for the deployment (in url)
        - blueprint id - name identifying the blueprint to use (in body)
        - blueprint_inputs - dictionary containing the blueprint inputs (in body)
        - workflow_name - name of the reconfiguration workflow that will be executed (in body)
        - workflow_inputs - dictionary containing the workflow inputs (in body)
    This call will initialise the blueprint to create a deployment.
    If a workflow name is supplied (e.g. install) it will subsequently run that workflow on the deployment.
    """
    LOGGER.info("Requested to create a deployment with id %s", deployment_id)
    thread_name = current_thread().getName()
    try:
        current_thread().setName(thread_name + ":create_deployment:" + deployment_id)

        if request.headers['Content-Type'] != 'application/json':
            return 'Supported Content-Type is application/json', 400

        blueprint_id = request.json.get('blueprint_id', None)
        blueprint_inputs = request.json.get('inputs', '{}')
        blueprint_file = request.json.get('blueprint_file', 'blueprint.yaml')
        workflow_name = request.json.get('workflow_name', None)
        workflow_inputs = request.json.get('workflow_inputs', {})

        if not blueprint_id:
            return "Missing parameter blueprint_id", 400

        LOGGER.info(
            "Input values for deployment are: blueprint_id : %s, blueprint inputs: %s, blueprint file: %s, workflow_name: %s, workflow_inputs: %s",
            blueprint_id, blueprint_inputs, blueprint_file, workflow_name, workflow_inputs)

        try:
            deployments.create(deployment_id, blueprint_id, blueprint_inputs, workflow_name, workflow_inputs)
        except (DeploymentAlreadyExistsError, InvalidNameError, BlueprintDoesNotExistError) as e:
            LOGGER.error(e.message)
            return str(e), 400
        except Exception as e:
            LOGGER.exception("Error creating deployment %s", deployment_id)
            return str(e), 500

        return "Request Accepted", 200
    finally:
        current_thread().setName(thread_name)


@app.route('/eso-services/deployments/<deployment_id>', methods=['DELETE'])
def delete_deployment(deployment_id):
    """ Deletes a deployment.
    The parameters are
        - deployment_id - unique name for the deployment (in url) which is to be deleted
    This call will kill the container which results in the nodes being removed using VNF-LAF
    and the subnets are deallocated in the nscmdb service
    """
    LOGGER.info("Requested to delete the deployment with id %s", deployment_id)
    thread_name = current_thread().getName()
    try:
        current_thread().setName(thread_name + ":delete_deployment:" + deployment_id)
        try:
            deployments.delete(deployment_id)
            return "Request Accepted", 200
        except DeploymentDoesNotExistError as e:
            LOGGER.error(e.message)
            return str(e), 404
        except Exception as e:
            LOGGER.exception("Error deleting deployment %s, reason: %s", deployment_id, e)
            return str(e), 500
    finally:
        current_thread().setName(thread_name)


@app.route('/eso-services/deployments/<deployment_id>', methods=['PUT'])
def execute_workflow(deployment_id):
    """ Executes a workflow on a deployment.
    The parameters are
        - workflow_name - name of the reconfiguration workflow that will be executed
        - workflow_inputs - dictionary containing the workflow inputs
    This call will execute a workflow on an existing deployment
    """
    LOGGER.info("Requested to execute a workflow on deployment with id %s", deployment_id)
    thread_name = current_thread().getName()
    try:
        current_thread().setName(thread_name + ":execute_workflow: " + deployment_id)
        if request.headers['Content-Type'] != 'application/json':
            return 'Supported Content-Type is application/json', 400

        workflow_name = request.json.get('workflow_name')
        workflow_inputs = request.json.get('workflow_inputs', {})

        if not workflow_name:
            return "Missing parameter workflow_name", 400

        try:
            deployments.execute_workflow(deployment_id, workflow_name, workflow_inputs)
            return "Request Accepted", 200
        except DeploymentDoesNotExistError as e:
            LOGGER.error(e.message)
            return str(e), 404
        except Exception as e:
            LOGGER.exception("Error while executing workflow %s for deployment %s", workflow_name, deployment_id)
            return str(e), 500
    finally:
        current_thread().setName(thread_name)


@app.route('/eso-services/deployments/<deployment_id>', methods=['GET'])
def get_deployment_nodes(deployment_id):
    """ Gets details for a given deployment
    The parameters are
        - deployment_id - name of the deployment

    The following information is returned
        - Deployment info (e.g. deployment id, blueprint, execution state, ...)
        - Runtime information in cloudify
        - Vapp and VM information from ECM
    """
    LOGGER.info("Requested to get details for deployment id %s", deployment_id)
    thread_name = current_thread().getName()
    try:
        current_thread().setName(thread_name + ":get_deployment_nodes:" + deployment_id)
        try:
            details = deployments.details(deployment_id)
            return jsonify(details)
        except DeploymentDoesNotExistError as e:
            LOGGER.error(e.message)
            return str(e), 404
        except Exception as e:
            LOGGER.exception("Error while getting details for deployment %s", deployment_id)
            return str(e), 500
    finally:
        current_thread().setName(thread_name)


@app.route('/eso-services/deployments/<deployment_id>/outputs', methods=['GET'])
def get_outputs(deployment_id):
    """ Gets outputs for a given deployment

    Args:
        deployment_id: name of the deployment

    Returns:
        The outputs as defined in the blueprint are returned
    """
    LOGGER.info("Requested to get outputs for deployment id %s", deployment_id)
    thread_name = current_thread().getName()
    try:
        current_thread().setName(thread_name + ":get_outputs:" + deployment_id)
        outputs = deployments.outputs(deployment_id)
        return jsonify(outputs)
    except DeploymentDoesNotExistError as e:
        LOGGER.exception(e.message)
        return str(e), 404
    except Exception as e:
        LOGGER.exception("Error getting outputs for deployment %s", deployment_id)
        return str(e), 500
    finally:
        current_thread().setName(thread_name)


@app.route('/eso-services/deployments/<deployment_id>/log/<log_name>', methods=['GET'])
def get_log_for_deployment(deployment_id, log_name):
    """ Gets the specified log for the deployment
    The parameters are
        - deployment_id - name of the deployment
        - log_name - name of the workflow log e.g. init / install
    """
    LOGGER.info("Requested to get log: %s for deployment: %s", log_name, deployment_id)
    thread_name = current_thread().getName()
    try:
        current_thread().setName(thread_name + ":get_log_for_deployment:" + deployment_id)
        return deployments.get_log(deployment_id, log_name)
    except Exception as e:
        LOGGER.exception("Error getting log %s for deployment %s", log_name, deployment_id)
        return str(e), 500
    finally:
        current_thread().setName(thread_name)

if __name__ == '__main__':
    LOGGER.info('--------- Starting ESO Service ---------')
    app.run(host='0.0.0.0', port=8081, debug=False)
    adpEventLogger.log_event('Started ESO Service on port: ' + 8081, 'info')

