# 프로덕션 배포 가이드

단풍바람 메생결산 시스템의 프로덕션 환경 배포 가이드입니다.

## 목차

1. [시스템 구성](#시스템-구성)
2. [사전 준비](#사전-준비)
3. [배포 방법](#배포-방법)
4. [환경별 설정](#환경별-설정)
5. [트러블슈팅](#트러블슈팅)

---

## 시스템 구성

### 아키텍처

```
클라이언트
    ↓
[Nginx :80] 
    ├─→ /api/* → 백엔드 API :8000 (FastAPI - 별도 프로젝트)
    └─→ /* → 프론트엔드 :3000 (SvelteKit Docker 컨테이너)
```

### 구성 요소

- **프론트엔드**: SvelteKit + Svelte 5 + Tailwind CSS 4
- **백엔드**: FastAPI (별도 프로젝트, http://localhost:8000에서 실행)
- **웹서버**: Nginx (리버스 프록시 및 정적 파일 서빙)
- **컨테이너**: Docker + Docker Compose

---

## 사전 준비

### 1. 시스템 요구사항

- Docker 20.10 이상
- Docker Compose 2.0 이상
- Git
- 최소 1GB 여유 메모리
- 최소 2GB 여유 디스크 공간

### 2. 백엔드 API 준비

백엔드 API가 **http://localhost:8000**에서 실행 중이어야 합니다.

API 엔드포인트 확인:
```bash
curl http://localhost:8000/health
curl http://localhost:8000/docs
```

### 3. 저장소 클론

```bash
git clone <repository-url>
cd dpbr_13_F
```

---

## 배포 방법

### 방법 1: 개발 환경 (로컬 테스트)

로컬에서 백엔드가 실행 중일 때 프론트엔드만 컨테이너로 실행합니다.

```bash
# 프론트엔드 빌드 및 실행
docker-compose -f docker-compose.dev.yml up -d

# 확인
curl http://localhost:3000
```

**접속 주소**: http://localhost:3000

---

### 방법 2: 통합 환경 (Nginx 프록시 포함)

프론트엔드와 Nginx를 함께 실행하여 단일 포트(80)로 서비스합니다.

#### 2-1. 환경 설정

`deploy/nginx-proxy.conf` 파일에서 백엔드 주소를 확인/수정합니다:

```nginx
location /api/ {
    # 백엔드 API 서버 주소
    proxy_pass http://host.docker.internal:8000;
    # ...
}
```

**설정 옵션**:
- `host.docker.internal:8000`: 호스트의 로컬 백엔드 연결 (개발/테스트)
- `backend:8000`: Docker 네트워크 내 백엔드 컨테이너 연결
- `<IP>:8000`: 다른 서버의 백엔드 연결

#### 2-2. 실행

```bash
# 빌드 및 실행
docker-compose up -d --build

# 로그 확인
docker-compose logs -f

# 상태 확인
docker-compose ps
```

#### 2-3. 확인

```bash
# 프론트엔드 접속
curl http://localhost

# API 프록시 테스트
curl http://localhost/api/v1/characters

# API 문서 접속
curl http://localhost/docs
```

**접속 주소**:
- 프론트엔드: http://localhost
- API 문서: http://localhost/docs
- Health Check: http://localhost/health

---

### 방법 3: 프로덕션 환경

실제 서버에 배포할 때 사용합니다.

#### 3-1. 환경 변수 설정

프론트엔드 API URL을 프로덕션 환경에 맞게 설정합니다.

**옵션 A: 프록시 사용 (권장)**
```bash
# docker-compose.prod.yml에서 설정
environment:
  - PUBLIC_API_URL=/api
```

**옵션 B: 직접 연결**
```bash
# docker-compose.prod.yml에서 설정
environment:
  - PUBLIC_API_URL=https://api.yourdomain.com
```

#### 3-2. Nginx 설정 업데이트

`deploy/nginx-proxy.conf`에서 백엔드 주소를 프로덕션 서버로 수정:

```nginx
location /api/ {
    proxy_pass http://<backend-server-ip>:8000;
    # ...
}
```

#### 3-3. 배포 실행

```bash
# 프로덕션 모드로 빌드 및 실행
docker-compose -f docker-compose.prod.yml up -d --build

# 로그 확인
docker-compose -f docker-compose.prod.yml logs -f

# Health check
curl http://localhost/health
```

#### 3-4. SSL/HTTPS 설정 (선택사항)

Let's Encrypt를 사용한 SSL 인증서 발급:

```bash
# Certbot 설치
sudo apt-get install certbot

# 인증서 발급
sudo certbot certonly --standalone -d yourdomain.com

# 인증서 복사
mkdir -p ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./ssl/key.pem
```

Nginx 설정에 HTTPS 추가 (nginx-proxy.conf):

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # ... 나머지 설정
}
```

---

## 환경별 설정

### 환경 변수

| 변수명 | 설명 | 개발 환경 | 프로덕션 환경 |
|--------|------|-----------|--------------|
| `PUBLIC_API_URL` | 백엔드 API URL | `http://localhost:8000` | `/api` 또는 `https://api.yourdomain.com` |

### 네트워크 설정

**호스트 네트워크 사용 (개발)**:
```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

**Docker 네트워크 사용 (프로덕션)**:
```yaml
networks:
  - dpbr-network
```

---

## 운영 관리

### 컨테이너 관리

```bash
# 시작
docker-compose up -d

# 중지
docker-compose down

# 재시작
docker-compose restart

# 로그 확인
docker-compose logs -f [service-name]

# 컨테이너 상태 확인
docker-compose ps
```

### 업데이트 배포

```bash
# 최신 코드 가져오기
git pull origin main

# 재빌드 및 재시작
docker-compose down
docker-compose up -d --build

# 또는 무중단 배포
docker-compose up -d --build --force-recreate
```

### 모니터링

```bash
# 리소스 사용량 확인
docker stats

# Health check
curl http://localhost/health
curl http://localhost/api/v1/characters
```

### 백업

```bash
# 설정 파일 백업
tar -czf backup-$(date +%Y%m%d).tar.gz \
    deploy/ \
    docker-compose*.yml \
    dpbr_front/.env
```

---

## 트러블슈팅

### 1. 프론트엔드가 API에 연결되지 않음

**증상**: 브라우저 콘솔에 CORS 에러 또는 네트워크 에러

**해결방법**:
```bash
# 백엔드 API 상태 확인
curl http://localhost:8000/health

# Nginx 설정 확인
docker exec dpbr-nginx cat /etc/nginx/conf.d/default.conf

# Nginx 재시작
docker-compose restart nginx
```

### 2. Nginx 502 Bad Gateway

**증상**: API 호출 시 502 에러

**원인**: 백엔드 API 서버가 실행되지 않았거나 연결할 수 없음

**해결방법**:
```bash
# 백엔드 API 확인
curl http://localhost:8000/health

# Nginx 로그 확인
docker-compose logs nginx

# 백엔드 주소 확인 (nginx-proxy.conf)
# host.docker.internal이 올바르게 설정되어 있는지 확인
```

### 3. 컨테이너가 시작되지 않음

**증상**: `docker-compose up` 실패

**해결방법**:
```bash
# 로그 확인
docker-compose logs

# 이미지 재빌드
docker-compose build --no-cache

# 기존 컨테이너 정리
docker-compose down -v
docker system prune -a
```

### 4. 포트 충돌

**증상**: `port is already allocated` 에러

**해결방법**:
```bash
# 포트 사용 확인 (Windows)
netstat -ano | findstr :80
netstat -ano | findstr :8000

# 포트 사용 확인 (Linux/Mac)
lsof -i :80
lsof -i :8000

# docker-compose.yml에서 포트 변경
ports:
  - "8080:80"  # 80 대신 8080 사용
```

### 5. 환경 변수가 적용되지 않음

**증상**: API URL이 변경되지 않음

**해결방법**:
```bash
# .env 파일 확인
cat dpbr_front/app/.env

# 재빌드 (환경 변수는 빌드 타임에 적용됨)
docker-compose up -d --build

# 컨테이너 환경 변수 확인
docker exec dpbr-frontend env | grep PUBLIC_API_URL
```

---

## CI/CD 통합

### GitHub Actions 예시

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build and Deploy
        run: |
          docker-compose -f docker-compose.prod.yml up -d --build
      
      - name: Health Check
        run: |
          sleep 10
          curl -f http://localhost/health || exit 1
```

---

## 참고 자료

- [Docker Compose 문서](https://docs.docker.com/compose/)
- [Nginx 설정 가이드](https://nginx.org/en/docs/)
- [SvelteKit 배포](https://kit.svelte.dev/docs/adapters)
- [FastAPI 문서](https://fastapi.tiangolo.com/)

---

## 문의

문제가 발생하면 이슈를 등록하거나 개발팀에 문의하세요.

**Made with ❤️ for 단풍바람 Club**
