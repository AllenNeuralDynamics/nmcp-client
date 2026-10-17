# Neuron Morphology Community Portal Client

The Portal Client is the user-facing front end application.

## Installation and Build

Building requires Node.js 22.18 or later (the GitHub workflow uses Node 24).

Neuroglancer is installed from a pinned commit of [google/neuroglancer](https://github.com/google/neuroglancer),
recorded in `package.json` and `package-lock.json`.  `npm install` downloads and builds that commit, so no separate
Neuroglancer checkout is needed.  The build installs Neuroglancer's own development dependencies, which include a
Playwright Chromium download; set `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` for the install to skip it.

* Clone the `nmcp-client` repository
* In the repository directory `npm install`

#### Updating Neuroglancer

* Pick a commit on the upstream `master` branch and copy its full 40-character SHA.  A shortened SHA is not enough:
  npm keeps the commit already in `package-lock.json` and reports the install as up to date.
* `npm install --save-dev github:google/neuroglancer#<full-sha>` updates `package.json` and `package-lock.json`
  together.
* Compare the `overrides` in Neuroglancer's `package.json` at that commit with the ones here and mirror any change.
  npm applies `overrides` only from the root project, so Neuroglancer's entries (today, keeping `ikonate`'s unused
  build tooling out of the install) have no effect unless copied.
* Build, run the tests and check each Neuroglancer view.

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


## Google Analytics
`NMCP_GOOGLE_ANALYTICS_TAG` optionally sets the Google Analytics measurement ID (e.g., `G-XXXXXXXXXX`) used by the
gtag.js snippet injected into `index.html` at server startup.  Set it to your own tag to distinguish deployments
(e.g., production vs. test instances).  If it is left unset, no analytics script is included in the page.


## Development Status Notes
See [here](client/README.md) for additional details on the status of the code.
