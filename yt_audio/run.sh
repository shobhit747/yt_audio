#!/bin/bash
VENV_PATH=$(pipenv --venv)

source "$VENV_PATH/bin/activate"

sleep 3

npm start
