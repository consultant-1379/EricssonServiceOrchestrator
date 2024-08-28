# Copyright (c) Ericsson 2018
# Creates docker container for the UI
FROM httpd:2.4
COPY ./ /var/www/html/
COPY ./httpd.conf /usr/local/apache2/conf/httpd.conf
COPY /eso-ui/root/target/deploymentRoot/ /var/www/html/
