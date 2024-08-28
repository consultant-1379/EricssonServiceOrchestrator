
################################################################################
#  THIS IS A 'DUMMY' CLASS THAT 'APPENDS' THE SUBNETWORK 'NODES TO THE ESO     #
#  NODES BY GOING TO NSLCM DIRECTLY AND GETTING THEM - JUST A HACK AS THIS     #
#  WILL PROBABLY BE VIA TOSCAO
################################################################################

import logging
import requests
import json
import os
import httplib

#os.environ['HOST_ADDRESS'] = ':' + os.environ['TOSCAO_PORT']

import toscaoclient

import servicemodel
import serviceinstance

NSLCM_PATH = '/nslcm'
DEPLOYMENTS_PATH = '/deployments'

LOGGER = logging.getLogger('EsoService')


#{
#	"creTime": "2017-12-07 09:36:49.896783",
#	"serviceModelID": "d7eceb9d-c2b0-43dd-9071-c79d60d0853f",
#	"id": "d0767cd2-c720-445d-8c98-92a0d48a1be7",
#	"name": "nslcm_thur",
#	"topology": {
#		"inputs": [{
#			"type": "string",
#			"name": "subnetwork_blueprint",
#			"value": "massive-mtc"
#		}, {
#			"type": "string",
#			"name": "subnetwork_name",
#			"value": "nslcm_thur"
#		}],
#		"nodes": [{
#			"state": "started",
#			"name": "subnet-massive-mtc_1",
#			"relationship": []
#		}],
#		"outputs": {}
#	}
#}

def get_nslcm_nodes(service_instance_name):
    service_instance_id = toscaoclient.get_service_instance_id_for_name(service_instance_name)
    service_instance = serviceinstance.get_service_instance(toscaoclient.BASE_URL, service_instance_id)
    subnet_deployment_name = None
    nodes = service_instance['topology']['nodes']
    if(service_instance):
        inputs = service_instance['topology']['inputs']
        for input in inputs:
            if input['name'] == 'subnetwork_name':
                subnet_deployment_name = input['value']
                break
        if(subnet_deployment_name):
            service_model_id = service_instance['serviceModelID']
            service_model = servicemodel.get_service_model(toscaoclient.BASE_URL, service_model_id)
            subnet_host = None
            if(service_model):
                for node_template in service_model['topology']['node_templates']:
                    if node_template['nodetype'] == 'subnet':
                        node_properties = node_template['nodeproperties']
                        for node_property in node_properties:
                            if node_property['name'] == 'host':
                                subnet_host = node_property['value']
                                break
            if(subnet_host):
                return get_nslcm_deployment_node_details(subnet_host, subnet_deployment_name)

def get_nslcm_deployment_node_details(host, deploymentName):
    LOGGER.info('get_deployment, host: %s, deployment %s', host, deploymentName)
    deployments_url = host + NSLCM_PATH + DEPLOYMENTS_PATH + '/' + deploymentName

    response = requests.get(deployments_url)
    if response.status_code == httplib.OK:
        LOGGER.info('got_deployment: %s', deploymentName)
        return json.loads(response.text)['nodes']

def get_nodes(service_instance_name):
    #TODO - move to services.py
    LOGGER.info('Retrieving nodes for service %s', service_instance_name)
    service_instance_id = toscaoclient.get_service_instance_id_for_name(service_instance_name)
    nodes = []
    service_instance = serviceinstance.get_service_instance(toscaoclient.BASE_URL, service_instance_id)


    LOGGER.info('Retrieved service instance %s for service %s', service_instance, service_instance_name)

    if None != service_instance:
        service_nodes = service_instance['topology']['nodes']
        for node in service_nodes:
            attributes = {}
            # TODO - update when TOSCAO provides attributes - not supported yet
            #for param_name, param in node.attributes.iteritems():
            #    attributes[param_name] = param.value

            relationships = []
            for relationship in node['relationship']:
                    relationships.append({"target_id": relationship['target'],
                                          "target_name": relationship['target'],
                                         "type": relationship['relationshiptype']})

            nodes.append({"id": node['name'],
                        "name": node['name'],
                        "runtime_properties": attributes,
                        "state": node['state'],
                        "relationships": relationships})

            nslcm_nodes = get_nslcm_nodes(service_instance_name)
            if nslcm_nodes:
                for nslcm_node in nslcm_nodes:
                    relationships = []
                    for relationship in nslcm_node['relationships']:
                        relationships.append({"target_id": relationship['target_id'],
                                              "target_name": relationship['target_name'],
                                              "type": relationship['type']})

                    nodes.append({"id": nslcm_node['id'],
                                  "name": nslcm_node['name'],
                                  "progress": nslcm_node['progress'],
                                  "runtime_properties": nslcm_node['runtime_properties'],
                                  "state": "unknown",
                                  "relationships": relationships})


    LOGGER.debug("Found %s node instances for service %s - %s", len(nodes), service_instance_name, nodes)
    return nodes

if __name__ == '__main__':
    #get_deployment_node_details('http://131.160.159.148', 'EPC-1')
    print json.dumps(get_nodes('test4'))
