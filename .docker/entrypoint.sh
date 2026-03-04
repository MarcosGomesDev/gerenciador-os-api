#!/bin/bash
yarn db:deploy
dumb-init node dist/src/main.js