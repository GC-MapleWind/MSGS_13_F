# API 연동 가이드

이 프로젝트는 별도의 FastAPI 백엔드와 연동되도록 구성되어 있습니다.

## 빠른 시작

> **TIP**: npm으로 개발하는 방법은 [QUICK_START.md](./QUICK_START.md)를 참고하세요!

### 방법 1: npm으로 개발 (추천)

```bash
# 1. 백엔드 API 실행 (별도 프로젝트)
# http://localhost:8000에서 실행되어야 함

# 2. 프론트엔드 실행
cd dpbr_front/app
cp .env.example .env
npm install
npm run dev

# 3. 브라우저에서 접속
# http://localhost:5173
```

### 방법 2: Docker로 실행 (배포 테스트용)

```bash
# 개발 환경
docker-compose -f docker-compose.dev.yml up -d

# 통합 환경 (Nginx 포함)
docker-compose up -d

# 접속: http://localhost:3000 또는 http://localhost
```

## API 엔드포인트

OpenAPI 스펙은 `openapi.json` 파일을 참고하세요.

### 주요 엔드포인트

- `GET /api/v1/characters` - 캐릭터 목록
- `GET /api/v1/characters/{id}` - 캐릭터 상세
- `GET /api/v1/characters/{id}/settlements` - 캐릭터의 메생결산 목록
- `GET /api/v1/settlements/{id}` - 메생결산 상세
- `GET /api/v1/comments` - 댓글 목록
- `POST /api/v1/comments` - 댓글 작성 (인증 필요)

### 인증 엔드포인트

- `POST /api/v1/users/login` - 로그인
- `POST /api/v1/users/signup` - 회원가입
- `POST /api/v1/users/auth/kakao/login` - 카카오 로그인
- `POST /api/v1/users/refresh` - 토큰 갱신
- `POST /api/v1/users/logout` - 로그아웃

## 프론트엔드에서 API 사용

### 기본 사용법

```typescript
import { getCharacters, getCharacterById } from '$lib/api';

// 캐릭터 목록 조회
const characters = await getCharacters();

// 특정 캐릭터 조회
const character = await getCharacterById('1');
```

### 환경 변수

프론트엔드 API URL은 환경 변수로 관리됩니다:

**개발 환경** (`.env`):
```
PUBLIC_API_URL=http://localhost:8000
```

**프로덕션 환경** (`.env.production`):
```
PUBLIC_API_URL=/api
```

## 프로덕션 배포

자세한 배포 가이드는 `deploy/PRODUCTION_GUIDE.md`를 참고하세요.

### 배포 방식

1. **개발 환경**: 프론트엔드만 Docker로 실행, 백엔드는 로컬
2. **통합 환경**: Nginx 프록시로 프론트엔드와 백엔드 통합
3. **프로덕션 환경**: SSL/HTTPS 적용, 헬스체크 설정

### 주요 파일

- `docker-compose.dev.yml` - 개발 환경
- `docker-compose.yml` - 통합 환경 (기본)
- `docker-compose.prod.yml` - 프로덕션 환경
- `deploy/nginx-proxy.conf` - Nginx 프록시 설정
- `dpbr_front/nginx/nginx.conf` - 프론트엔드 Nginx 설정

## API 타입 정의

API 응답 타입은 OpenAPI 스펙을 기반으로 정의되어 있습니다:

```typescript
// src/lib/types.ts
export interface Character {
  id: string;
  name: string;
  nickname: string;
  avatarUrl: string;
  level: number;
  job: string;
  club: string;
  server: string;
}

export interface SettlementItem {
  id: string;
  characterId: string;
  title: string;
  description: string;
  imageUrl: string;
  acquiredAt: string;
}

export interface TalkComment {
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}
```

## 트러블슈팅

### CORS 에러

백엔드에서 CORS를 허용하도록 설정하거나, Nginx 프록시를 사용하세요.

### API 연결 실패

1. 백엔드가 실행 중인지 확인: `curl http://localhost:8000/health`
2. 환경 변수 확인: `.env` 파일의 `PUBLIC_API_URL`
3. 네트워크 설정 확인: Docker 사용 시 `host.docker.internal`

### 개발 환경 설정

**백엔드 실행**:
```bash
# 백엔드 프로젝트 디렉토리에서
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**프론트엔드 실행**:
```bash
cd dpbr_front/app
npm run dev
```

## 추가 정보

- [프로덕션 배포 가이드](deploy/PRODUCTION_GUIDE.md)
- [메인 README](README.md)
- [OpenAPI 스펙](openapi.json)
