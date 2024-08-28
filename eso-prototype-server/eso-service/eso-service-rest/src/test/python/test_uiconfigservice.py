import unittest
from mock import patch
import uiconfig


class TestUiConfigService(unittest.TestCase):
    _CONFIG_FILE_LOCATION = "../python/resources/ui-config/"
    _VALID_CONFIG_FILE = _CONFIG_FILE_LOCATION + "UIConfig.yaml"
    _EMPTY_CONFIG_FILE = _CONFIG_FILE_LOCATION + "EmptyUIConfig.yaml"
    _INVALID_CONFIG_FILE = _CONFIG_FILE_LOCATION + "UIConfigNotAlignedToSchema.yaml"
    _EXPECTED_RESULT = {'UIConfiguration': {'nodeViewer': {'columnDefinition': {'basedOnAttribute': 'node_type',
                                                                                'columns': [{'name': 'External Nodes',
                                                                                             'attributeValues': [
                                                                                                 {'colour': 'green',
                                                                                                  'type': 'ericsson.nodes.external',
                                                                                                  'icon': 'default'}]},
                                                                                            {'name': 'Dedicated Nodes',
                                                                                             'attributeValues': [
                                                                                                 {'colour': 'green',
                                                                                                  'type': 'ericsson.nodes.MME',
                                                                                                  'icon': 'default'},
                                                                                                 {'colour': 'green',
                                                                                                  'type': 'ericsson.nodes.EPG',
                                                                                                  'icon': 'default'}]},
                                                                                            {'name': 'VPN',
                                                                                             'attributeValues': [
                                                                                                 {'colour': 'green',
                                                                                                  'type': 'ericsson.nodes.VPN',
                                                                                                  'icon': 'default'}]}]}}}}
    _EMPTY_RESULT = {}

    @patch('ariaclient.read_resource')
    def test_GIVEN_validYamlInput_WHEN_getUiConfiguration_THEN_correctOutput(self, config_file_mock):
        with open(TestUiConfigService._VALID_CONFIG_FILE) as config_file:
            config_file_contents = config_file.read()
            config_file_mock.return_value = config_file_contents
            configuration_data = uiconfig.get_ui_configuration("dummy_deployment_id", "dummy_blueprint_id")
            self.assertEquals(self._EXPECTED_RESULT, configuration_data)

    @patch('ariaclient.read_resource')
    def test_GIVEN_emptyYamlInput_WHEN_getUiConfiguration_THEN_emptyOutput(self, config_file_mock):
        with open(TestUiConfigService._EMPTY_CONFIG_FILE) as config_file:
            config_file_contents = config_file.read()
            config_file_mock.return_value = config_file_contents
            configuration_data = uiconfig.get_ui_configuration("dummy_deployment_id", "dummy_blueprint_id")
            self.assertEquals(self._EMPTY_RESULT, configuration_data)

    @patch('ariaclient.read_resource')
    def test_GIVEN_inputNotAlignedToSchema_WHEN_getUiConfiguration_THEN_emptyOutput(self, config_file_mock):
        with open(TestUiConfigService._INVALID_CONFIG_FILE) as config_file:
            config_file_contents = config_file.read()
            config_file_mock.return_value = config_file_contents
            configuration_data = uiconfig.get_ui_configuration("dummy_deployment_id", "dummy_blueprint_id")
            self.assertEquals(self._EMPTY_RESULT, configuration_data)


if __name__ == '__main__':
    unittest.main()
