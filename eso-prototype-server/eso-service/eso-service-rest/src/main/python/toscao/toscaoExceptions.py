class BlueprintDoesNotExistError(Exception):
    """Thrown if the blueprint does not exist"""
    def __init__(self, blueprint_id, blueprint_file=None):
        message = "Blueprint {0} does not exist".format(
            blueprint_id) if not blueprint_file else "Blueprint file {0} does not exist for blueprint {1}".format(blueprint_file, blueprint_id)
        super(BlueprintDoesNotExistError, self).__init__(message)


class DeploymentDoesNotExistError(Exception):
    """Thrown if the deployment does not exist"""
    def __init__(self, deployment_name):
        message = "Deployment {0} does not exist".format(deployment_name)
        super(DeploymentDoesNotExistError, self).__init__(message)


class DeploymentAlreadyExistsError(Exception):
    """Thrown if the deployment already exists"""
    def __init__(self, deployment_name):
        message = 'Deployment with id {0} already exists'.format(deployment_name)
        super(DeploymentAlreadyExistsError, self).__init__(message)

		
class InvalidNameError(Exception):
    def __init__(self, msg):
        if msg is None:
            msg = "Invalid Name."
        super(InvalidNameError, self).__init__(msg)

class BadRequestException(Exception):
    def __init__(self, msg):
        if msg is None:
            msg = "Bad Request."
        super(BadRequestException, self).__init__(msg)

class InternalServerException(Exception):
    def __init__(self, msg):
        if msg is None:
            msg = "Internal Server Error."
        super(InternalServerException, self).__init__(msg)

class PluginAlreadyExistsException(Exception):
    def __init__(self, msg):
        if msg is None:
            msg = "An error occured with installing plugin."
        else:
            self.name = msg.split()[1]
            self.version = msg.split()[4]
        super(PluginAlreadyExistsException, self).__init__(msg)

class PluginNotFoundException(Exception):
    def __init__(self, msg):
        if msg is None:
            msg = "An error occured with plugin."
        super(PluginNotFoundException, self).__init__(msg)

class PluginInUseException(Exception):
    def __init__(self, msg):
        if msg is None:
            msg = "An error occured with plugin."
        super(PluginInUseException, self).__init__(msg)

class ServiceModelNotFoundException(Exception):
    def __init__(self, msg):
        if msg is None:
            msg = "An error occured with service model."
        super(v, self).__init__(msg)

class ServiceModelInUseException(Exception):
    def __init__(self, msg):
        if msg is None:
            msg = "An error occured with service model."
        super(ServiceModelInUseException, self).__init__(msg)

class ServiceInstanceNotFoundException(Exception):
    def __init__(self, msg):
        if msg is None:
            msg = "An error occured with service instance."
        super(ServiceInstanceNotFoundException, self).__init__(msg)

class ServiceInstanceActiveException(Exception):
    def __init__(self, msg):
        if msg is None:
            msg = "An error occured with service intance."
        super(ServiceInstanceActiveException, self).__init__(msg)

class ServiceExecutionNotFoundException(Exception):
    def __init__(self, msg):
        if msg is None:
            msg = "An error occured with service execution."
        super(ServiceExecutionNotFoundException, self).__init__(msg)
