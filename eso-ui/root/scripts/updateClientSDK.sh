#!/usr/bin/env bash

cd ..

echo "Reminder : Stop any running local cdt2 server) !!"
echo "Reminder : Check in the build.json changes after test build and UI, etc !!"

for package in *; do
    if test -f "$package/build.json"; then
        cdt2 package unlink $package

        echo "checking updates for "
        echo $package/build.json
        cd  $package
        cdt2 package check-updates
        cd ..
    fi
done

echo "build.json files changed unless up to date already"