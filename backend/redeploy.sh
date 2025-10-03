#!/bin/bash

./stop.sh
git stash
git pull
git stash pop
./gradlew bootJar
./gradlew --stop
./start.sh

