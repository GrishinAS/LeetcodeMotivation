#!/bin/bash

./stop.sh
git stash
git pull
git stash pop
./gradlew bootJar --no-daemon
./start.sh

