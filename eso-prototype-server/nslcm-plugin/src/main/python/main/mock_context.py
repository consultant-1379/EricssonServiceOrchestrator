###############################################################################
# COPYRIGHT Ericsson 2017
#
# The copyright to the computer program(s) herein is the property of
# Ericsson Inc. The programs may be used and/or copied only with written
# permission from Ericsson Inc. or in accordance with the terms and
# conditions stipulated in the agreement/contract under which the
# program(s) have been supplied.
###############################################################################
import logging



class Node(object):

    def __init__(self, properties, attributes, name):
        self._properties = properties
        self._attributes = attributes
        self._name = name

    @property
    def properties(self):
        return self._properties

    @property
    def attributes(self):
        return self._attributes

    @property
    def name(self):
        return self._name

class MockContext(object):
    INSTRUMENTATION_FIELDS=[{""}]
    def __init__(self,
                 properties,
                 attributes,
                 name):
        self.node = Node(properties, attributes, name)
        self.logger = logging.getLogger()

    def get_resource(self, template_path):  # pylint: disable=no-self-use
        resource = None
        with open(template_path, 'r') as f:
            resource = f.read()
        return resource
