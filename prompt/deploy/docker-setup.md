# Docker 기반 배포 서버 설정 가이드

## 📋 전제 조건

- Ubuntu 20.04 이상
- sudo 권한
- 인터넷 연결

---

## 1️⃣ 서버에 Docker 설치

```bash
# 서버 접속
ssh <USERNAME>@<SERVER_IP>

# Docker 설치 (간편 방식)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# ⚠️ 프로덕션 환경에서는 공식 저장소를 사용하는 것을 권장합니다
# 자세한 내용: https://docs.docker.com/engine/install/ubuntu/

# 현재 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER

# 재로그인 (권한 적용)
exit
ssh <USERNAME>@<SERVER_IP>

# 설치 확인
docker --version
```

---

## 2️⃣ Nginx 리버스 프록시 설정

Docker 컨테이너는 포트 3000에서 실행되므로, Nginx로 80 포트를 프록시합니다.

```bash
# Nginx 설치
sudo apt update
sudo apt install -y nginx

# Nginx 설정 파일 생성
sudo nano /etc/nginx/sites-available/dpbr-frontend
```

다음 내용을 입력:

```nginx
server {
    listen 80;
    server_name _;  # 또는 도메인명

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

설정 활성화:

```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/dpbr-frontend /etc/nginx/sites-enabled/

# 기본 설정 제거
sudo rm /etc/nginx/sites-enabled/default

# 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 3️⃣ 배포 디렉토리 설정

서버에서 소스 코드를 받아 빌드합니다:

```bash
# 배포 디렉토리 생성
mkdir -p ~/dpbr_deploy
cd ~/dpbr_deploy

# 디렉토리 구조 확인
ls -la
```

---

## 4️⃣ 방화벽 설정 (필요시)

```bash
# UFW 사용 시
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp  # HTTPS 사용 시
sudo ufw allow 22/tcp   # SSH

# 방화벽 활성화
sudo ufw enable
```

---

## 5️⃣ 수동 배포 테스트

```bash
# 배포 디렉토리로 이동
cd ~/dpbr_deploy/dpbr_front

# Docker 이미지 빌드
docker build -t dpbr-frontend:latest .

# 컨테이너 실행 (localhost만 바인딩 - 보안 강화)
docker run -d \
  --name dpbr-frontend \
  --restart unless-stopped \
  -p 127.0.0.1:3000:80 \
  dpbr-frontend:latest

# 확인
docker ps
docker logs dpbr-frontend
curl http://localhost:3000
```

브라우저에서 `http://<SERVER_IP>` 접속 확인 (Nginx를 통해)

---

## 6️⃣ GitHub Actions Secrets 설정

GitHub 저장소 → Settings → Secrets and variables → Actions

| Secret 이름 | 값 | 설명 |
|-------------|-----|------|
| `SSH_PRIVATE_KEY` | SSH 개인 키 | 서버 접속용 |
| `SERVER_HOST` | `<SERVER_IP>` | 서버 IP 또는 도메인 |
| `SERVER_USER` | `<USERNAME>` | SSH 사용자명 |

---

## 7️⃣ 배포 흐름

```text
1. PR 머지 → main 브랜치
2. GitHub Actions 자동 실행
   ├─ 소스 코드 체크아웃
   ├─ 서버에 소스 코드 전송 (scp)
   ├─ 서버에서 Docker 이미지 빌드
   ├─ 기존 컨테이너 중지/제거
   ├─ 새 컨테이너 실행
   └─ Health check
3. 배포 완료!
```

**장점**:
- GHCR 접근 권한 불필요
- 서버 환경에 맞게 빌드
- 네트워크 대역폭 절약 (이미지 push/pull 불필요)

---

## 🔍 트러블슈팅

### 문제: Docker 권한 에러
```bash
# 해결
sudo usermod -aG docker $USER
# 재로그인 필요
```

### 문제: 포트 3000이 이미 사용 중
```bash
# 사용 중인 프로세스 확인
sudo lsof -i :3000
# 기존 컨테이너 중지
docker stop dpbr-frontend
docker rm dpbr-frontend
```

### 문제: Nginx 502 Bad Gateway
```bash
# Docker 컨테이너 상태 확인
docker ps
docker logs dpbr-frontend

# Nginx 재시작
sudo systemctl restart nginx
```

### 문제: Docker 빌드 실패
```bash
# 빌드 로그 확인
cd ~/dpbr_deploy/dpbr_front
docker build -t dpbr-frontend:latest .

# 디스크 공간 확인
df -h

# 빌드 캐시 정리
docker builder prune
```

---

## 📊 유용한 명령어

```bash
# 컨테이너 로그 확인
docker logs dpbr-frontend

# 컨테이너 재시작
docker restart dpbr-frontend

# 이미지 목록
docker images

# 구버전 이미지 정리 (dangling 이미지만)
docker image prune

# 사용하지 않는 모든 이미지 정리 (주의: 롤백용 이미지도 삭제됨!)
# docker image prune -a

# 컨테이너 내부 접속
docker exec -it dpbr-frontend sh
```

---

## 🎯 다음 단계 (선택사항)

### HTTPS 설정 (Let's Encrypt)

```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d your-domain.com

# 자동 갱신 테스트
sudo certbot renew --dry-run
```

### 자동 업데이트 (Watchtower)

> **⚠️ 보안 경고**: Watchtower는 Docker 소켓에 접근하므로 호스트 시스템에 대한 전체 제어 권한을 가집니다. 신뢰할 수 있는 환경에서만 사용하고, 보안 위험을 충분히 인지해야 합니다.

```bash
# Watchtower 실행 (자동으로 새 이미지 감지 및 업데이트)
docker run -d \
  --name watchtower \
  --restart unless-stopped \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower \
  dpbr-frontend
```

**대안**: GitHub Actions의 자동 배포를 사용하는 것이 더 안전합니다.

---

완료! 🎉
