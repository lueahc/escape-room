#!/bin/bash

echo "--------------- 서버 배포 시작 -----------------"
cd /home/ubuntu/instagram-server
npm i
pm2 kill
pm2 start ecosystem.config.js --env development --name "dev-backend-server"
echo "--------------- 서버 배포 끝 -----------------"
pm2 list