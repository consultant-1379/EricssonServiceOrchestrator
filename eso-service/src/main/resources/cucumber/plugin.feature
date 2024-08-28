Feature: Plugins can be retrieved
#no plugin, one plugins, more plugins

Scenario: Client makes call to GET on /plugins and get successfully 200
	Given No plugin exists  
	When Client calls GET on /plugins
	Then Client receives 200 and empty result set with "entity" and "response"
	
Scenario: Client makes a call to GET on /plugins and get 200
	Given One plugin existed
	When Client calls GET pn /plugins
	Then Client receives 200 and one plugin as response
	
Scenario: Client makes a requst to GET on /plugins successfully
	Given Multiple plugins existed
	When client calls GET on /plugins
	Then Client receives 200 and a list of plugins
	
Scenario: Client makes a rest call to GET on /plugins and not found the server
	Given Client calls GET on /plugins may have not found
	Then Client receives 404 as status code
	
Scenario: Client sends a call to GET on /plugins and there is a confliction
	Given Client calls GET on /plugins may have confliction
	Then Client receives a confliction from the server
	
