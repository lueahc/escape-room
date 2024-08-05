#!/bin/bash

# echo "--------------- 서버 배포 시작 -----------------"
# cd /home/ubuntu/escape-room
# docker compose down
# docker compose pull
# docker compose up --build -d
# echo "--------------- 서버 배포 끝 ------------------"
echo "--------------- 서버 배포 시작 -----------------"
docker stop escape-room-server || true
docker rm escape-room-server || true
docker pull 851725195427.dkr.ecr.ap-northeast-2.amazonaws.com/escape-room-server:latest
docker run -d --name escape-room-server -p 5000:5000 851725195427.dkr.ecr.ap-northeast-2.amazonaws.com/escape-room-server:latest
echo "--------------- 서버 배포 끝 ------------------"