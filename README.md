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


## Development Status Notes
A consolidation/transition to mobx for local (non-query) state was in progress when Mouse Light development ended.  It has
been picked up a little with NMCP development, but it is not complete and a lot of areas are in a mixed/not ideal state.

Class-based React components were common when the original project started, but have since been deprecated by React.  Most
have been transitioned to function-based components, however a few more complicated ones remain.  These are being 
transitioned as time allows or those components need significant updates for other reasons.

Semantic UI (React) ceased development since it was first used with the project in 2015.  Mantine UI has been added and is
being used for new components and when existing components require significant updates.  The two component libraries coexist
mostly peacefully in terms of potential conflicts w/style sheets and similar.  Some additional dependencies, while still
maintained, may also be able to be removed due to being available in Mantine that were not part of Semantic UI (date picker
and toast/notifications for example).  The one heavily used component that does not have a direct Maintine equivalent is
`Segment` and its associated children.  A custom Mantine-derived replacement may simplify updating the code base.
