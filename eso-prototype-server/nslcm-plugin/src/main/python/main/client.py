###################################################
# <p>
# Copyright (c) 2017 Ericsson AB, Sweden.
# All rights reserved.
# The Copyright to the computer program(s) herein is the property of
# Ericsson AB, Sweden.
# The program(s) may be used and/or copied with the written permission
# from Ericsson AB or in accordance with the terms and conditions
# stipulated in the agreement/contract under which the program(s)
# have been supplied.
# </p>
###################################################

""" Module to test plugin"""

from aria import operation
import requests
import json
import httplib
from retrying import retry

NSLCM_PATH = '/nslcm'
DEPLOYMENTS_PATH = '/deployments'
BLUEPRINTS_PATH = '/blueprints'
INPUTS_PATH = '/inputs'


@operation
def create_deployment(ctx=None, **kwargs):
    blueprint_id = kwargs.get('blueprint_id')
    host = ctx.node.properties.get('host')
    name = ctx.node.properties.get('name')

    ctx.logger.info('create_deployment: host={0}, blueprint_id={1}, name={2}'.format(host, blueprint_id, name))

    # this method was added to make available to unit test - should be done differently
    create_blueprint_deployment(ctx, blueprint_id)

    ctx.logger.info('create_deployment: initiated OK')

@operation
def delete_deployment(ctx=None, **kwargs):
    host = ctx.node.properties.get('host')
    name = ctx.node.properties.get('name')

    ctx.logger.info('delete_deployment: host={0}, name={1}'.format(host, name))

    nslcm_url = host + NSLCM_PATH
    delete_blueprint_deployment(nslcm_url, name, ctx)

    ctx.logger.info('delete_deployment: initiated OK')

def create_default_inputs(text_input):
    decoded = json.loads(text_input)
    default_data = {}
    for x in decoded['inputs']:
        default_data[x] = decoded['inputs'].get(x).get('default')
    return default_data

def get_default_inputs_for_blueprint(nslcm_url, blueprint_id, ctx=None):
    try:
        inputs_url = nslcm_url + BLUEPRINTS_PATH + '/' + blueprint_id + INPUTS_PATH
        ctx.logger.info('Going to read inputs from: {0}'.format(inputs_url))
        response = requests.get(inputs_url)
        if response.status_code == httplib.OK:
            ctx.logger.info('NSLCM Server returned: {0}: '.format(json.loads(response.text)))
            return create_default_inputs(response.text)
        else:
            ctx.logger.error('NSLCM Server returned: {0}: '.format(json.loads(response.status_code)))
    except requests.exceptions.BaseHTTPError as e:
        ctx.logger.info('NSLCM Server returned exception: {0}: '.format(e))

def monitor_progress(deployments_url, workflow_name='install', ctx=None):
    @retry(retry_on_result=_retry_if_progress_not_finished)
    def _retry_progress_until_finished(deployments_url, workflow_name):
        workflow_state = get_workflow_state(deployments_url, workflow_name, ctx)
        return workflow_state

    _retry_progress_until_finished(deployments_url, workflow_name)

def _retry_if_progress_not_finished(state):
    return (state == 0 )

def get_workflow_state(deployments_url, workflow_name, ctx=None):
    workflow_state=None
    headers = {'Content-type': 'application/json'}

    response = requests.get(deployments_url, headers=headers)
    workflows = json.loads(response.text).get('executed_workflows')
    for i in range(len(workflows)):
        if workflows[i].get('workflow_name') == workflow_name:
            workflow_status = workflows[i].get('status')
            ctx.node.attributes['Progress'] = workflows[i].get('status')
            workflow_state = workflows[i].get('execution_state')
            ctx.logger.info('Workflow: {0}, Status: {1}, State: {2}'.format(workflow_name, workflow_status,
                                                                   workflows[i].get('execution_state')))
            break
    return workflow_state

def create_blueprint_deployment(ctx, blueprint_id):

    host = ctx.node.properties.get('host')
    nslcm_url = host + NSLCM_PATH

    name = ctx.node.properties.get('name')

    workflow_name = 'install'
    inputs  = get_default_inputs_for_blueprint(nslcm_url, blueprint_id, ctx)
    payload = {
        'blueprint_id':blueprint_id,
        'inputs':inputs,
        'workflow_name': workflow_name
    }
    deployments_url = nslcm_url + DEPLOYMENTS_PATH + '/' + name
    ctx.node.attributes['Subnetwork Details'] = deployments_url
    headers = {'Content-type': 'application/json'}
    ctx.logger.info('create_blueprint_deployment: going to create with url={0}, payload={1}'.format(deployments_url, json.dumps(payload)))

    try:
        response = requests.post(deployments_url, data=json.dumps(payload), headers=headers)
        if response.status_code == httplib.OK:
            monitor_progress(deployments_url, workflow_name, ctx)
            ctx.logger.info('Success: {0}'.format(response.text))
        else:
            ctx.logger.info('Failure: {0}'.format(response.status_code))

    except requests.exceptions.HTTPError as e:
        ctx.logger.info('NSLCM Server returned exception: {0}: '.format(e))

def delete_blueprint_deployment(nslcm_url, name, ctx=None):

    deployments_url = nslcm_url + DEPLOYMENTS_PATH + '/' + name

    headers = {'Content-type': 'application/json'}
    ctx.logger.info('delete_blueprint_deployment: going to delete with url={0}'.format(deployments_url))

    try:
        response = requests.delete(deployments_url, headers=headers)
        if response.status_code == httplib.OK:
            ctx.logger.info('Success: {0}'.format(response.text))
        else:
            ctx.logger.info('Failure: {0}'.format(response.status_code))

    except requests.exceptions.HTTPError as e:
        ctx.logger.info('NSLCM Server returned exception: {0}: '.format(e))