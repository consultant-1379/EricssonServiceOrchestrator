import logging

from toscao import toscaoclient

from model import Plugin

LOGGER = logging.getLogger('EsoService')
BUILT_IN_WORKFLOWS = {"install": {}, "uninstall": {}}


def ls():
    plugin_list = []
    stored_plugins =  toscaoclient.get_plugins()
    for stored_plugin in stored_plugins:
        plugin = Plugin(stored_plugin['name'], stored_plugin['version'], stored_plugin['uploadTime'])
        LOGGER.info("ls() adding: %s: ", plugin.__dict__)
        plugin_list.append(plugin.__dict__)
    return plugin_list

def load_plugin(file):
    return toscaoclient.load_plugin(file)

def delete(plugin_name, plugin_version):
    return toscaoclient.delete_plugin(plugin_name, plugin_version)
