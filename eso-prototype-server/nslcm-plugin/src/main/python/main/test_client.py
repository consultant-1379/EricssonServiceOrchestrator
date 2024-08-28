import unittest
import requests_mock

import client

from mock_context import MockContext


class NSLCMClientPluginUnitTest(unittest.TestCase):

    _DEFAULT_INPUTS = {
  "inputs": {
    "input_1": {
      "default": "value_1",
      "description": "This is an input parameter",
      "type": "string"
    }
  }
}

    _SUCCESSFUL_DEPLOYMENT = {
    "executed_workflows": [{
      "error_details": "Successfully executed install workflow for deployment.",
      "execution_state": 1,
      "status": 100,
      "workflow_name": "install"}]
    }

    _FAILED_DEPLOYMENT = {
    "executed_workflows": [{
      "error_details": "Failed to execute install workflow for deployment.",
      "execution_state": 2,
      "status": 80,
      "workflow_name": "install"}]
    }

    _TEST_NODE_NAME = 'test_node_name'

    @requests_mock.mock()
    def test_GIVEN_something_WHEN_successfulDeployment_THEN_correctProgressSet(self, requests_mock):
        ctx = MockContext(properties={"host":"http://localhost", "name":"deployment_1"}, attributes={}, name=self._TEST_NODE_NAME)

        self.set_nsmlcm_mock_behaviour(requests_mock, inputs=[{'json': self._DEFAULT_INPUTS}],
                                       deployment=[{'json': self._SUCCESSFUL_DEPLOYMENT}])

        client.create_blueprint_deployment(ctx, blueprint_id = "blueprint_id")
        self.assertTrue((ctx.node.attributes['Progress'] is 100), "Incorrect Progress retturned.")

    @requests_mock.mock()
    def test_GIVEN_something_WHEN_failedDeployment_THEN_correctProgressSet(self, requests_mock):
        ctx = MockContext(properties={"host":"http://localhost", "name":"deployment_1"}, attributes={}, name=self._TEST_NODE_NAME)

        self.set_nsmlcm_mock_behaviour(requests_mock, inputs=[{'json': self._DEFAULT_INPUTS}],
                                       deployment=[{'json': self._FAILED_DEPLOYMENT}])

        client.create_blueprint_deployment(ctx, blueprint_id = "blueprint_id")
        self.assertTrue((ctx.node.attributes['Progress'] is 80), "Incorrect Progress retturned.")

    def set_nsmlcm_mock_behaviour(self, requests_mock, inputs=None, deployment=None):
        requests_mock.get('http://localhost/nslcm/blueprints/blueprint_id/inputs', inputs)
        requests_mock.post('http://localhost/nslcm/deployments/deployment_1', status_code=200)
        requests_mock.get('http://localhost/nslcm/deployments/deployment_1', deployment)


