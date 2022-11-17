#!/usr/bin/env bash
set -e

BRANCH=main
WORKDIR=firstroom

## Update the project
cd "/var/www/${WORKDIR}"
git checkout "$BRANCH"
git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"

docker-compose up -d --build