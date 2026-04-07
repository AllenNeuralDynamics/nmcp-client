#!/usr/bin/env bash

logName=$(date '+%Y-%m-%d_%H-%M-%S');

mkdir -p /var/log/nmcp

export DEBUG=mnb:*,nmcp:*

node --max-http-header-size=32768 app.js >> /var/log/nmcp/nmcp-client-${logName}.log 2>&1
