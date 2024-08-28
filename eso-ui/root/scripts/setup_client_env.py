import os

def full_client_setup():
    'Calls bash scripts in order and launches local server '

    os.system('updateClientSDK.sh')

    os.system('buildMe.sh')

    os.system('runServer.sh')


full_client_setup()
