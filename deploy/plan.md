# Nginx 리버스 프록시 설정 (dpbr-frontend) — Docker 기반 배포

## 배포 방식: Docker
이 가이드는 **Docker로 배포된** dpbr-frontend를 위한 설정입니다.  
CI/CD에서 main 브랜치 머지 시 서버에서 `docker build` 후 컨테이너로 실행됩니다.  
**Nginx도 Docker 컨테이너로** 실행합니다.

## 현재 상황
- dpbr-frontend Docker 컨테이너: 127.0.0.1:3000 에서 실행 중
- 80 포트로 외부 접근 가능하게 하려면 Nginx 프록시 필요

## 작업 목표
**Docker로 Nginx**를 실행하여 80 포트 요청을 dpbr-frontend(3000)로 프록시

---

## 1. Nginx 설정 파일 생성

```bash
mkdir -p ~/dpbr_deploy/nginx

cat > ~/dpbr_deploy/nginx/dpbr-frontend.conf << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://host.docker.internal:3000;
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
EOF
```

## 2. Nginx Docker 컨테이너 실행

```bash
docker run -d \
  --name dpbr-nginx \
  --restart unless-stopped \
  --add-host=host.docker.internal:host-gateway \
  -p 80:80 \
  -v ~/dpbr_deploy/nginx/dpbr-frontend.conf:/etc/nginx/conf.d/default.conf:ro \
  nginx:alpine
```

- `--add-host=host.docker.internal:host-gateway`: 컨테이너에서 호스트(localhost:3000) 접근용

## 3. 확인

```bash
curl -I http://localhost
# HTTP/1.1 200 OK 이 나오면 성공
```

## 4. 기존 Nginx 컨테이너 재시작 (설정 변경 시)

```bash
docker restart dpbr-nginx
```
