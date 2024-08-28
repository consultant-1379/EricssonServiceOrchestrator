#!/usr/bin/env bash

cd ../eso-main

if [[ "$@" == "--skip" ]]
then
    echo "Skipping package installation."
else
    cdt2 package install --autofill

    for package in ../*; do
      if test -f "$package/build.json"; then
        cdt2 package link $package
        echo finished linking packages in  $package
      fi
    done

fi

if [[ "$@" == "--proxy" ]]
then
      echo "Using  proxy server pointing to remote IP address"
      cdt2 serve --proxy-config proxy.json

elif [[ "$@" == "--proxy-local" ]]
then
    echo "Using eso locally running server"
    cdt2 serve --proxy-config eso-service-proxy.json
else
    echo "Using eso mock node.js server"
    cdt2 serve -m server.js 
fi
