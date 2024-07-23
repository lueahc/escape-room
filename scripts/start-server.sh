#!/bin/bash

echo "--------------- 서버 배포 시작 -----------------"
cd /home/ubuntu/escape-room
docker compose down
docker compose pull
docker compose up --build -d
echo "--------------- 서버 배포 끝 ------------------"