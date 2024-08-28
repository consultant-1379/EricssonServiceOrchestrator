from datetime import datetime  # timedelta
import logging
import re
import hashlib
from esoRestExceptions import InvalidNameError

LOGGER = logging.getLogger('EsoService')

class Plugin(object):

    def __init__(self, plugin_name, version, upload_time):
        self.id = hashlib.md5(plugin_name + version).hexdigest()
        self.plugin_name = plugin_name
        self.version = version
        self.upload_time = upload_time

class ServiceModel(object):

    def __init__(self, id, name, mainSTFile, creTime, description):
        self.id = id
        self.name = name
        self.service_template_file_name = mainSTFile
        self.upload_time = creTime
        self.description = description

class Deployment(object):

    _DEPLOYMENT_NAME_PATTERN = re.compile("^[A-Za-z0-9_][A-Za-z0-9_-]+$")
    _DATETIME_FORMATTER = "%Y-%m-%dT%H:%M:%SZ"

    def __init__(self, name, blueprint_id, deployment_id=None, **kwargs):
        if not Deployment._DEPLOYMENT_NAME_PATTERN.match(name):
            raise InvalidNameError('{} is not a valid deployment name. The name must match the pattern: {}'.format(
                name, Deployment._DEPLOYMENT_NAME_PATTERN.pattern))

        self.name = name
        self.blueprint_id = blueprint_id
        self.deployment_id = deployment_id
        self.initialization_time = kwargs.get('initialization_time', datetime.utcnow().strftime(Deployment._DATETIME_FORMATTER))
        self.executed_workflows = kwargs.get('executed_workflows', [])

    def workflow_started(self, workflow_name):
        self.executed_workflows.append({"workflow_name": workflow_name, "associated_deployment": "", "status": 0,
                                        "execution_state": ExecutionState.IN_PROGRESS,
                                        "start_date": datetime.utcnow().strftime(Deployment._DATETIME_FORMATTER),
                                        "end_date": None, "created_by": "", "error_details": ''})

    def workflow_finished_successfully(self):
        self.executed_workflows[-1]["execution_state"] = ExecutionState.COMPLETE_SUCCESS
        self.executed_workflows[-1]["status"] = 100
        self.executed_workflows[-1]["end_date"] = datetime.utcnow().strftime(Deployment._DATETIME_FORMATTER)

    def workflow_finished_with_error(self, error_details):
        self.executed_workflows[-1]["execution_state"] = ExecutionState.COMPLETE_ERROR
        self.executed_workflows[-1]["error_details"] = error_details
        self.executed_workflows[-1]["end_date"] = datetime.utcnow().strftime(Deployment._DATETIME_FORMATTER)


class NodeInstance(object):

    def __init__(self, node_instance, deployment_inputs, workflow_last_executed):
        self.main_id = node_instance.get('id', '')
        self.main_name = node_instance.get('name', '')
        self.node_id = node_instance.get('name', '')
        self.relationships = node_instance.get('relationships', [])
        self.runtime_properties = node_instance.get('runtime_properties', {})
        self.vapps = []
        self.node_state = node_instance.get('state')
        if workflow_last_executed == 'uninstall':
            self.progress = self.__determine_uninstall_progress()
        else:
            self.progress = self.__determine_install_progress()


    def __determine_install_progress(self):
        progress = 0
        if "Progress" in self.runtime_properties:
            vnflaf_progress = int(self.runtime_properties.get("Progress", 0))
            if self.node_state in ('creating', 'created', 'configuring', 'configured', 'starting'):
                progress = vnflaf_progress if vnflaf_progress != 100 else 0
            elif self.node_state == 'started':
                progress = 100
            del self.runtime_properties["VNF_LAF_Progress"]
        elif self.node_state == "succeeded":
            progress = 100
        elif self.node_state == "started":
            progress = 50
        LOGGER.info("install progress - node=%s, state=%s, progress=%s", self.node_id, self.node_state, progress)
        return progress

    def __determine_uninstall_progress(self):
        progress = 0
        if 'VNF_LAF_Progress' in self.runtime_properties:
            vnflaf_progress = int(self.runtime_properties.get("VNF_LAF_Progress", 0))
            if self.node_state == 'deleting':
                progress = vnflaf_progress if vnflaf_progress != 100 else 0
            elif self.node_state == 'deleted':
                progress = 100
            del self.runtime_properties['VNF_LAF_Progress']
        elif self.node_state == 'deleted':
            progress = 100
        LOGGER.info("uninstall progress- node=%s, state=%s, progress=%s", self.node_id, self.node_state, progress)
        return progress

    def get_as_dict(self):
        result = dict()
        result['id'] = self.main_id
        result['name'] = self.main_name
        result['node_id'] = self.node_id
        result['progress'] = self.progress
        result['relationships'] = self.relationships
        result['runtime_properties'] = self.runtime_properties
        result['vapps'] = self.vapps
        return result


class ExecutionState(object):
    # pylint: disable=R0903
    IN_PROGRESS = 0
    COMPLETE_SUCCESS = 1
    COMPLETE_ERROR = 2
