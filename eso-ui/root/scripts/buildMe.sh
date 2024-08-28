if [[ "$@" == "--skip" ]]
then
    echo "Skipping package installs and unlinking (good to unlink when change common lib code for example)."
    cd ..
else
    cd ../eso-main
    cdt2 package unlink eso-ui
    cdt2 package unlink eso-commonlib
    cdt2 package unlink eso-topologylib
    cdt2 package unlink eso-service-templates
    cdt2 package unlink eso-create-slice

    cdt2 package install --autofill
    cd ..
fi

cdt2 build --packages eso-commonlib,eso-topologylib,eso-main,eso-create-slice,eso-service-templates --output eso-ui.tar.gz --prop-version 1.0.0 --deploy target/deploymentRoot