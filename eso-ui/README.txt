This UI is using client SDK lib
ref : https://arm1s11-eiffel004.eiffel.gic.ericsson.se:8443/nexus/content/sites/tor/uisdk/latest/index.html

It can be run against a (fake data) node.js / express sever or pointed to a real server.

For first time UI use 
1) Would need Node.js and Client Dev Tool Environment  (with npm) installed:

    Tested using Node.js version  v8.9.4

    Follow:
    https://arm1s11-eiffel004.eiffel.gic.ericsson.se:8443/nexus/content/sites/tor/cdt/latest/cdt2beta.html

Tested using:   (run cdt2 self-update if not using latest - as will need  cdt-serve @ 2.3.19 for file upload to work) :

$ cdt2 --version
Client Development Tools CLI 2.5.6

Packages:
  cdt-build @ 2.5.7
  cdt-package @ 2.4.9
  cdt-serve @ 2.3.19     (important for file upload to work)
  cdt-skeleton @ 2.3.1



2) (potential) Extras from npm. Enter to this root folder (where package.json is located):
Type :  npm install--dev

3) Then go to  \root\scripts in git bash or similar and
   run buildMe.sh  (or python set_up_client.py to run server in one go) 
   
4)  To run ESO UI  use either :

a) ./runServer.sh   (to point to mock data), or
b) ./runServer.sh --proxy    to point to IP you have set up in root\eso-main\proxy.json   (e.g. if used 'docker compose up' to launch server)

c)  ./runServer.sh --proxy-local  to point to locally running ESO server - see notes below


3) View ESO UI work in progress on a browser at port 8585
(http://localhost:8585/#eso-ui)

--------------------------------------------------------------------------------------------
Notes - local ESO server - if not using docker compose (e.g. debugging) :
1) From Docker shell :    docker login --username <signum> armdocker.rnd.ericsson.se        (supply LAN password for your signum id)
2) docker run -itd --name=tosca1.0.0 -P --privileged -p 192.168.99.100:7001:7001 -e "TOSCAO_LOG_LEVEL=DEBUG" armdocker.rnd.ericsson.se/proj-tosca_o/toscao:1.0.1
3) See TOSACA message at http://192.168.99.100:7001/toscao/api/v2.0  to test its up)

(or run via IDE as per Dev notes below)

Dev Environment Notes  (hacks): When running to local server using runServer.sh --proxy-local

1) Running server side in IDE (Eclipse) instead - change ToscaoManagerService class
   to replace #getToscaoServiceUrl   (do not check in) so it returns  "http://192.168.99.100:7001" + version

   and use same run time config D args as used in server side ReadMe file.
   -Drun.arguments="spring.profiles.active=test"
   -Dtomcat.util.http.parser.HttpParser.requestTargetAllow={}


-------------------------------------------------------------------------------------

Reading the code:

1) Main Entry point class is :   "eso-ui\root\eso-main\src\eso-ui\MainApplication.js"
which is part of the "eso-main" application.

2) With Client SDK (v1) framework one can divide UI into modular "applications" with life cycle methods (pause, resume, etc).
This UI has to date the following applications :

eso-commonlib,eso-main,eso-create-slice,eso-topologylib,eso-service-templates

(eso-commonlib is more of a common library of shared code used by the applications, rather than an application itself)


With Client SDK (v1) Applications create Region classes (contained in regions folders) which define an area of the screen.
Regions can contain widgets (contained in widgets folders).
These concepts are explained here :
e.g. https://arm1s11-eiffel004.eiffel.gic.ericsson.se:8443/nexus/content/sites/tor/jscore/latest/api/classes/jscore_core.Region.html

Typically every widget follows the client SDK (v1) examples of having
a "controller" javascript file(.js)  which creates a "view" file (.html) which is styled using a CSS file (.less).

3) All the REST calls used by the UI are in
"eso-ui\root\eso-commonlib\src\eso-commonlib\constants\UrlConstants"



-----------------------------------------------------------------------------

Client SDK (v1) aids to learning:

a) API : https://arm1s11-eiffel004.eiffel.gic.ericsson.se:8443/nexus/content/sites/tor/uisdk/latest/index.html
b) SDK Sample projects : e.g. download system demo https://arm1s11-eiffel004.eiffel.gic.ericsson.se:8443/nexus/content/sites/tor/uisdkdemos/latest/
c) Tutorials : https://arm1s11-eiffel004.eiffel.gic.ericsson.se:8443/nexus/content/sites/tor/jscore/latest/
d) Forums: e.g. https://confluence-nam.lmera.ericsson.se/display/WL/Forums
e) SDK source code : For example for grids find - https://arm1s11-eiffel004.eiffel.gic.ericsson.se:8443/nexus/content/sites/tor/tablelib/latest/
   click on Examples link and download  git clone http://presentation-layer.lmera.ericsson.se/repos/client-sdk/tablelib.git  as advised.
f) Other ENM projects that used v1  - https://gerrit.ericsson.se/#/admin/projects/
