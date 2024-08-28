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
