#!/bin/bash
# Initialization file for the Getty Portal.
# Run this first once you have cloned the project.
# Right now this just sets environment variables.
# Important: You MUST this script from the root directory of the project.

if [[ $PORTAL_ROOT ]]; then
  echo "The PORTAL_ROOT environment var is already set. Project has already been initialized. All is well. Please make any necessary adjustments to your environment manually."
else
  echo "the working dir is.."
  export PORTAL_ROOT=$(pwd)
  if [[ $1 = "--production" ]]; then
    echo "You have set production environment!!!"
    export NODE_ENV="production"
  else
    export NODE_ENV="development"
  fi
  export NODE_PATH=$(pwd)

  echo "PORTAL_ROOT is " $PORTAL_ROOT
  echo "NODE_PATH is " $NODE_PATH
  echo "NODE_ENV is " $NODE_ENV
fi


