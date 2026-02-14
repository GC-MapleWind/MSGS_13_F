# 환경별 설정 가이드

Docker Compose 환경에 따른 설정 방법을 설명합니다.

## 📋 환경 구분

### 1. 로컬 개발 환경 (npm)
- **프론트엔드**: npm으로 직접 실행
- **백엔드**: 별도 프로젝트에서 실행
- **포트**: 프론트엔드 5173, 백엔드 8000

### 2. Docker 개발 환경 (docker-compose.dev.yml)
- **프론트엔드**: Docker 컨테이너
- **백엔드**: 호스트에서 실행 (localhost:8000)
- **프록시**: 없음 (직접 연결)

### 3. Docker 통합 환경 (docker-compose.yml)
- **프론트엔드**: Docker 컨테이너
- **백엔드**: 호스트에서 실행
- **프록시**: Nginx (포트 80)

### 4. 프로덕션 환경 (docker-compose.prod.yml)
- **프론트엔드**: Docker 컨테이너
- **백엔드**: Docker 컨테이너
- **프록시**: Nginx (포트 80/443)

---

## 🔧 환경별 설정

### 1. 로컬 개발 환경 (npm)

**백엔드 실행**:
```bash
# 백엔드 프로젝트에서
uvicorn main:app --reload --port 8000
```

**프론트엔드 실행**:
```bash
cd dpbr_front/app
cp .env.example .env
npm install
npm run dev
```

**환경 변수** (`dpbr_front/app/.env`):
```env
PUBLIC_API_URL=http://localhost:8000
```

**접속 주소**:
- 프론트엔드: http://localhost:5173
- 백엔드: http://localhost:8000

---

### 2. Docker 개발 환경

백엔드는 호스트에서, 프론트엔드만 Docker로 실행합니다.

**백엔드 실행**:
```bash
# 백엔드 프로젝트에서
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**프론트엔드 실행**:
```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

**네트워크 설정**:
- 프론트엔드 → 백엔드: `host.docker.internal:8000`

**환경 변수**:
- `PUBLIC_API_URL=http://host.docker.internal:8000`

**접속 주소**:
- 프론트엔드: http://localhost:3000
- 백엔드: http://localhost:8000

**Nginx 설정**: 없음 (직접 연결)

---

### 3. Docker 통합 환경 (기본)

프론트엔드와 Nginx를 Docker로 실행하고, Nginx가 프록시 역할을 합니다.

**백엔드 실행**:
```bash
# 백엔드 프로젝트에서
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**프론트엔드 + Nginx 실행**:
```bash
docker-compose up -d --build
```

**네트워크 설정**:
- Nginx → 프론트엔드: `http://frontend:80` (Docker 네트워크)
- Nginx → 백엔드: `http://host.docker.internal:8000` (호스트)

**환경 변수**:
- `PUBLIC_API_URL=/api`

**Nginx 설정**: `deploy/nginx-dev.conf`
```nginx
# 프론트엔드
location / {
    proxy_pass http://frontend:80;  # Docker 서비스 이름
}

# 백엔드
location /api/ {
    proxy_pass http://host.docker.internal:8000;  # 호스트
}
```

**접속 주소**:
- 통합: http://localhost
- API 문서: http://localhost/docs

---

### 4. 프로덕션 환경

프론트엔드, 백엔드, Nginx 모두 Docker 컨테이너로 실행합니다.

**환경 변수 설정**:
```bash
# .env 파일 생성
cp .env.example .env

# 환경 변수 수정
nano .env
```

**실행**:
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

**네트워크 설정**:
- Nginx → 프론트엔드: `http://frontend:80` (Docker 네트워크)
- Nginx → 백엔드: `http://backend:8000` (Docker 네트워크)

**환경 변수**:
- `PUBLIC_API_URL=/api`
- 백엔드 환경 변수는 `.env` 파일에서 로드

**Nginx 설정**: `deploy/nginx-proxy.conf`
```nginx
# 프론트엔드
location / {
    proxy_pass http://frontend:80;  # Docker 서비스 이름
}

# 백엔드
location /api/ {
    proxy_pass http://backend:8000;  # Docker 서비스 이름
}
```

**접속 주소**:
- 프로덕션: http://your-domain.com
- API 문서: http://your-domain.com/docs

---

## 🔍 설정 차이점 요약

| 환경 | 프론트엔드 | 백엔드 | Nginx | API URL |
|------|----------|--------|-------|---------|
| **로컬 개발** | npm | 호스트 | 없음 | `http://localhost:8000` |
| **Docker 개발** | 컨테이너 | 호스트 | 없음 | `http://host.docker.internal:8000` |
| **Docker 통합** | 컨테이너 | 호스트 | 컨테이너 | `/api` |
| **프로덕션** | 컨테이너 | 컨테이너 | 컨테이너 | `/api` |

### 프론트엔드 → 백엔드 연결

| 환경 | 연결 방식 |
|------|----------|
| **로컬 개발** | 직접 연결 (`localhost:8000`) |
| **Docker 개발** | 직접 연결 (`host.docker.internal:8000`) |
| **Docker 통합** | Nginx 프록시 (`/api` → `host.docker.internal:8000`) |
| **프로덕션** | Nginx 프록시 (`/api` → `backend:8000`) |

### Nginx → 프론트엔드 연결

| 환경 | 연결 방식 |
|------|----------|
| **Docker 통합** | `http://frontend:80` (Docker 서비스 이름) |
| **프로덕션** | `http://frontend:80` (Docker 서비스 이름) |

---

## ⚠️ 주의사항

### 1. Docker 네트워크 내부 통신
- **올바른 방법**: `http://service-name:port` (예: `frontend:80`, `backend:8000`)
- **잘못된 방법**: `http://host.docker.internal:port` (컨테이너 → 컨테이너는 사용 불가)

### 2. 호스트 → 컨테이너 통신
- Docker 컨테이너가 호스트의 서비스에 접근할 때만 `host.docker.internal` 사용
- 예: Docker 프론트엔드 → 호스트 백엔드

### 3. 포트 번호
- 프론트엔드 컨테이너: **80번** 포트 사용 (Nginx가 정적 파일 서빙)
- 백엔드: **8000번** 포트
- Nginx: **80번/443번** 포트 (외부 노출)

### 4. 환경 변수
- 프론트엔드는 **빌드 타임**에 환경 변수 적용 (`PUBLIC_*`)
- 백엔드는 **런타임**에 환경 변수 적용

---

## 🐛 트러블슈팅

### 1. Nginx 502 Bad Gateway

**증상**: API 또는 프론트엔드 접근 불가

**원인**: Nginx가 백엔드/프론트엔드에 연결할 수 없음

**해결**:
```bash
# 서비스 이름 확인
docker-compose ps

# 네트워크 확인
docker network ls
docker network inspect dpbr_13_f_dpbr-network

# 서비스 간 통신 테스트
docker exec dpbr-nginx ping frontend
docker exec dpbr-nginx ping backend
```

### 2. 프론트엔드에서 API 연결 안 됨

**증상**: CORS 에러 또는 네트워크 에러

**확인사항**:
```bash
# 환경 변수 확인
docker exec dpbr-frontend-prod env | grep PUBLIC_API_URL

# 백엔드 Health Check
curl http://localhost/health
curl http://localhost/api/v1/characters
```

### 3. 환경 변수 적용 안 됨

**해결**:
```bash
# 프론트엔드는 재빌드 필요 (빌드 타임 변수)
docker-compose up -d --build frontend

# 백엔드는 재시작만으로 가능 (런타임 변수)
docker-compose restart backend
```

---

## 📚 참고 파일

- `docker-compose.yml` - Docker 통합 환경
- `docker-compose.dev.yml` - Docker 개발 환경  
- `docker-compose.prod.yml` - 프로덕션 환경
- `deploy/nginx-dev.conf` - 개발용 Nginx 설정
- `deploy/nginx-proxy.conf` - 프로덕션용 Nginx 설정
- `.env.example` - 환경 변수 템플릿

---

**Made with ❤️ for 단풍바람 Club**
