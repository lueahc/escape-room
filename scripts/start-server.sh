#!/bin/bash

# 스크립트가 실패할 경우 전체 배포 실패
set -e
echo "--------------- 서버 배포 시작 -----------------"
cd /home/ec2-user/app
docker-compose down
docker-compose pull
docker-compose up -d
echo "--------------- 서버 배포 끝 ------------------"