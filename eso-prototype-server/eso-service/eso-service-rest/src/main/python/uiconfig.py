import logging
import yaml
import config

from toscao import toscaoclient
LOGGER = logging.getLogger('EsoService')


UICONFIG_SCHEMA = {
    "type": "object",
    "properties": {
        "UIConfiguration": {
            "type": "object",
            "properties": {
                "nodeViewer": {
                    "type": "object",
                    "properties": {
                        "columnDefinition": {
                            "type": "object",
                            "properties": {
                                "basedOnAttribute": {"type": "string"},
                                "columns": {"$ref": "#/definitions/columns"}
                            },
                            "required": ["basedOnAttribute", "columns"],
                            "additionalProperties": False
                        }
                    },
                    "required": ["columnDefinition"],
                    "additionalProperties": False
                }
            },
            "required": ["nodeViewer"],
            "additionalProperties": False
        }
    },
    "required": ["UIConfiguration"],
    "additionalProperties": False,

    "definitions": {
        "columns": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "attributeValues": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "type": {"type": "string"},
                                "icon": {"type": "string"},
                                "colour": {"type": "string"}
                            },
                            "required": ["type", "icon", "colour"],
                            "additionalProperties": False
                        },
                        "minItems": 1
                    }
                },
                "required": ["name", "attributeValues"],
                "additionalProperties": False
            },
            "minItems": 1
        }
    }
}


def get_ui_configuration(deployment_id, blueprint_id):
    config_file_contents = toscaoclient.read_resource(config.UI_CONFIG_FILE)
    if config_file_contents:
        try:
            with open(config.UI_CONFIG_FILE, 'r') as stream:
                configuration_data = yaml.load(stream)
                if configuration_data:
                    #TODO put back in
                    #validate(configuration_data, UICONFIG_SCHEMA)
                    LOGGER.info("Returning configuration_data: %s", configuration_data)

                return configuration_data
            LOGGER.warn("UI Configuration file %s does not contain any configuration", config.UI_CONFIG_FILE)
        except Exception:
            LOGGER.exception("Error reading the UI configuration file %s", config.UI_CONFIG_FILE)
    LOGGER.warn("Returning empty UI configuration for deployment %s", deployment_id)
    return {}
