#!/bin/bash

set -e  # 오류 발생 시 스크립트 종료

echo "--------------- 서버 배포 시작 -----------------"

BRANCH=$(cat /home/ubuntu/temp-server/branch.txt)
echo "Current branch is: $BRANCH"

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

chown -R ubuntu:ubuntu /home/ubuntu/$DIRECTORY
chmod -R 755 /home/ubuntu/$DIRECTORY

cp -r /home/ubuntu/temp-server/* /home/ubuntu/$DIRECTORY/
echo "Files copied to $DIRECTORY"

rm -rf /home/ubuntu/temp-server/*
echo "Temp server directory cleared"

cd /home/ubuntu/$DIRECTORY
echo "Changed directory to $DIRECTORY"

npm i
echo "npm dependencies installed"

pm2 stop $APP_NAME || true
echo "pm2 application stopped (if it was running)"

pm2 start ecosystem.config.js --env $APP_STATUS
echo "start pm2 application"
pm2 list