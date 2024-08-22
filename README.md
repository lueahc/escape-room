# 🔏 ESCAPE-ROOM SERVER 🔏

**방탈출 게임 기록 서비스**
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white) ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white) ![TypeORM](https://img.shields.io/badge/TypeORM-262627?style=for-the-badge&logo=typeorm&logoColor=white) ![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)

## Description

방탈출 게임에 참여한 팀원들의 기록과 리뷰를 체계적으로 관리하고 공유할 수 있는 플랫폼

## Running the app

```bash
# installation
$ npm install

# local env
$ npm run start

# development env
$ npm run start:dev

# production env
$ npm run start:prod
```

## Test

```bash
$ npm run test
```

## Tech Stack

- **Language**: TypeScript
  - 자바스크립트에 정적 타입을 추가하여 코드의 안정성과 가독성을 높이기 위해 선택했습니다.
- **Framework**: NestJS
  - 구조적이고 모듈화된 방식으로 Node.js 백엔드 애플리케이션을 개발할 수 있어서 선택했습니다.
- **Database**: MySQL
  - 안정적이고 성능이 뛰어나며, AWS RDS에서 쉽게 관리할 수 있어 선택했습니다.
- **ORM**: TypeORM
  - 데이터베이스와의 상호작용을 객체 지향적으로 처리하여 코드의 일관성을 유지하기 위해 사용했습니다.
- **Deploy**: AWS EC2, Docker
  - 일관된 배포 환경을 구축하고 애플리케이션의 이식성과 관리 효율성을 높이기 위해 사용했습니다.
- **CI/CD**: Github Actions, AWS(ECR, S3, CodeDeploy)
  - 신뢰할 수 있는 배포 파이프라인을 구축하여 자동적인 배포를 보장하기 위해 선택했습니다.

## Architecture

![escape_room_architecture](https://github.com/user-attachments/assets/a6334abd-2f89-4443-a97d-001b06050609)
