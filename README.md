# Neuron Browser Search Client

The Search Client service is the user-facing front end to the denormalized neuron browser data.


### Authentication
By default the service requires basic authentication when `NODE_ENV` is set to `production`.  The authentication is
not designed for multi-user, public instances.  It is simply intended to prevent inadvertent use by internal users
prior to data being fully vetted and ready for internal consumption.

Username and password can be set using
* `SEARCH_AUTH_USER`
* `SEARCH_AUTH_PASS`

At minimum the placeholder password should be overridden when authentication is enabled.

Authentication is disabled when `NODE_ENV` is not `production` or if `SEARCH_AUTH_REQUIRED` is set to false.

### Export
The front end supports export (download) of neuron data in SWC and JSON format.  This is handled by a separate service.
In non-production mode, the dev server directly proxies the requests (anything under /swc and /json) to the Export API
service.  In the production node env it is assumed that there is a dedicated load balancer/proxy in front of all services
that directs those requests to the Export API service.  If not present the requests will return no found.