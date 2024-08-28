Ericsson Service Orchestrator
=============================

This repository contains prototype code for POC's.
It should not be assumed that it is any more than that.

### Setup

Requires software:

* [Docker](https://docs.docker.com/engine/installation/)
* [Docker Compose](https://docs.docker.com/compose/install/)

#### Ericsson Docker Registry

You need to login to Ericsson armdocker, in order to be able to pull image.

Execute:

```bash
docker login armdocker.rnd.ericsson.se
```

#### Linux

Required sysctl configuration:

```bash
sudo sysctl -w vm.max_map_count=262144 # For ElasticSearch datalake service
```

#### ELX

ELX installation have non-standard network configuration. 
Because of that network inside containers will not work properly (outside internet will not be visible).

* Follow instructions [here](https://wiki.lmera.ericsson.se/wiki/Docker#Internet_Access_inside_container)
  * **Notes:**
    * **Do not** put configuration in systemd service as ELX wiki suggests!
    * Instead, use [cross-platform daemon.json file](https://docs.docker.com/engine/admin/systemd/#custom-docker-daemon-options) to store configuration.
    * Default path: `/etc/docker/daemon.json`

Example configuration:

```json
{
    "dns": ["193.181.14.11", "93.181.14.10", "153.88.112.200"]
}​
```

### Quickstart

**Start ESO:**

```bash
docker-compose up
docker-compose -d # to run in detached mode
```

**Stop ESO:**

```bash
docker-compose down
```

**Stop ESO and delete all volumes:**

```bash
docker-compose down -v
```

### Notes

* Checkout `docs/` for various project-related documentation and examples.
* If you have IntelliJ 2013.3, then you can use Editor-based HTTP client defined in `docs/http/`.
* Please, consult individual modules and their specific `README.md` files to understand specific implementation details.

### Structure

```
├── docs/
│   └── examples/
│       └── adp/              # ADP platform examples
│   └── http/                 # HTTP clients for manual ESO testing
│   └── toscao-blueprints/    # Blueprints examples
├── eso/                      # Root folder for project services
│   ├── backend/              # Module providing ESO REST interface
│   ├── ui/                   # Module providing ESO ui
│   └── toscao-plugin-nslcm/  # TOSCA-O plugin that integrates with nlcm
├── docker-compose.yml        # Configuration for starting ESO project with all modules
└── README.md                 # This README
```

### Links

* [Confluence](https://confluence-nam.lmera.ericsson.se/display/ESO)
