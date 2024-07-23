#!/bin/bash

# 스크립트가 실패할 경우 전체 배포 실패
echo "--------------- 서버 배포 시작 -----------------"
cd /home/ubuntu/escape-room
docker-compose down
docker-compose pull
docker-compose up --build -d
echo "--------------- 서버 배포 끝 ------------------"