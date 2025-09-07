#!/bin/bash

export DB_USERNAME=
export DB_PASSWORD=
export DB_URL=
export SPRING_PROFILES_ACTIVE=prod
./gradlew bootJar

java -Xmx500m -Duser.timezone=PST8 -jar ./build/libs/leetcode-motivation-service-0.1.jar &
APP_PID=$!

echo $APP_PID > java_pid

echo App started with pid: $APP_PID
