#!/usr/bin/env bash

logName=$(date '+%Y-%m-%d_%H-%M-%S');

export DEBUG=mnb*

node app.js >> /var/log/nmcp/search-client-${logName}.log 2>&1
