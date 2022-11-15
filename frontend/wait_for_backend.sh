#!/bin/sh

# Abort on any error (including if wait-for-it fails).
set -e

# Wait for the backend to be up, if we know where it is.
#if [ -n "$T" ]; then
  /wait-for-it.sh anythink-backend-node:3000
#fi

# Run the main container command.
exec curl --head -X GET --retry 10 --retry-connrefused --retry-delay 1 anythink-backend-node:3000/api/ping

