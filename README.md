# Neuron Morphology Community Portal Client

The Portal Client is the user-facing front end application.

## Installation and Build

The `nmcp-client` and Neuroglancer repositories should be cloned under the same top-level directory.  If that is not
possible, `package.json` will need to be modified to correctly reference the location of the Neuroglancer repository: `"neuroglancer": "file:../nmcp-neuroglancer/dist/package"`

* Clone the NMCP Neuroglancer fork
* In the repository directory `npm run build-package`


* Clone the `nmcp-client` repository
* In the repository directory `npm install`

#### Run Local
Depending on your setup, a number of env vars for the host/port of the database, API service, etc... will likely need to be set.
See the `nmcp-deploy` project for details on system configuration.  Once a local system is generally configured:

* `tsc`
* `npm run debug`

#### Build Production Distribution and Docker Images

Docker image building and deployment uses [Task](https://taskfile.dev/).

To build the dist package
* `task build`

To build the docker image
* `task docker-build`

To release the docker image (requires credentials to ghcr.io).
* `task release`

## Authentication
`NMCP_AUTHENTICATION_KEY` must be set to match the value used for the API service.


## Precomputed Skeleton Data Source
`NMCP_PRECOMPUTED_OUTPUT` must be set to define the precomputed skeleton location for Neuroglancer layers.  This is just
the location URL, e.g., `s3://mybucket/skeletons/staging`.  The appropriate prefix will be automatically attached as a
Neuroglancer data source (e.g., `precomputed://`)


## Development Status Notes
See [here](client/README.md) for additional details on the status of the code.
