#!/bin/bash

echo "--------------- 서버 배포 시작 -----------------"

BRANCH=$(cat /home/ubuntu/temp-server/branch.txt)

if [ "$BRANCH" = "main" ]; then
  DIRECTORY="escape-room"
  PORT=3000
  APP_STATUS="production"
elif [ "$BRANCH" = "develop" ]; then
  DIRECTORY="escape-room-dev"
  PORT=5000
  APP_STATUS="development"
else
  echo "Unknown branch: $BRANCH"
  exit 1
fi

# chown -R ubuntu:ubuntu /home/ubuntu/$DIRECTORY
# chmod -R 755 /home/ubuntu/$DIRECTORY

cp -r /home/ubuntu/temp-server/* /home/ubuntu/$DIRECTORY/
rm -rf /home/ubuntu/temp-server/*
cd /home/ubuntu/$DIRECTORY
npm i
pm2 stop $APP_NAME || true
pm2 start ecosystem.config.js --env $APP_STATUS