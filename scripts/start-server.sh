#!/bin/bash

echo "--------------- 서버 배포 시작 -----------------"

BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$BRANCH" = "main" ]; then
  DIRECTORY="escape-room"
  PORT=3000
  APP_NAME="main-backend-server"
  APP_STATUS="production"
elif [ "$BRANCH" = "develop" ]; then
  DIRECTORY="escape-room-dev"
  PORT=5000
  APP_NAME="develop-backend-server"
    APP_STATUS="development"
else
  echo "Unknown branch: $BRANCH"
  exit 1
fi

mv /home/ubuntu/temp-server/* /home/ubuntu/$DIRECTORY/
cd /home/ubuntu/$DIRECTORY
npm i
npm pm2 start ecosystem.config.js --env $APP_STATUS

echo "--------------- 서버 배포 끝 -----------------"