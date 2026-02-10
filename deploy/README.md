# 프론트엔드 배포 가이드

단풍바람 프론트엔드 애플리케이션을 서버에 배포하는 방법을 설명합니다.

## 📋 목차

1. [서버 초기 설정](#1-서버-초기-설정)
2. [GitHub Secrets 설정](#2-github-secrets-설정)
3. [자동 배포 (CI/CD)](#3-자동-배포-cicd)
4. [수동 배포](#4-수동-배포)

---

## 1. 서버 초기 설정

### 1.1 서버 접속

```bash
ssh ark1st@168.107.45.180
```

### 1.2 초기 설정 스크립트 실행

```bash
# 스크립트 다운로드
curl -o setup_frontend.sh https://raw.githubusercontent.com/YOUR_USERNAME/dpbr_2026/main/deploy/setup_frontend.sh

# 실행 권한 부여
chmod +x setup_frontend.sh

# 실행
./setup_frontend.sh
```

이 스크립트는 자동으로:
- Nginx 설치 및 설정
- Node.js 설치
- 배포 디렉토리 생성
- 백엔드 API와 프론트엔드를 함께 서빙하도록 Nginx 설정

---

## 2. GitHub Secrets 설정

GitHub 저장소 → Settings → Secrets and variables → Actions

| Secret 이름 | 값 | 설명 |
|------------|-----|------|
| `SSH_PRIVATE_KEY` | SSH 개인 키 내용 | 백엔드와 동일한 키 |
| `SERVER_HOST` | `168.107.45.180` | 서버 IP |
| `SERVER_USER` | `ark1st` | 서버 사용자명 |
| `FRONTEND_DEPLOY_PATH` | `/home/ark1st/dpbr_frontend` | 프론트엔드 배포 경로 |

---

## 3. 자동 배포 (CI/CD)

### 3.1 배포 트리거

- `main` 브랜치에 push
- GitHub Actions에서 수동 실행

### 3.2 배포 프로세스

1. **Build**: SvelteKit 앱 빌드
2. **Test**: 타입 체크
3. **Deploy**: 빌드 파일을 서버로 전송
4. **Reload**: Nginx 재시작

### 3.3 배포 확인

- 프론트엔드: http://168.107.45.180/
- API 문서: http://168.107.45.180/docs

---

## 4. 수동 배포

### 4.1 로컬에서 빌드

```bash
cd dpbr_front/app
npm install
npm run build
```

### 4.2 서버로 전송

```bash
scp -r build/* ark1st@168.107.45.180:/home/ark1st/dpbr_frontend/
```

### 4.3 Nginx 재시작

```bash
ssh ark1st@168.107.45.180
sudo systemctl reload nginx
```

---

## 5. 문제 해결

### Nginx 오류

```bash
# 로그 확인
sudo tail -f /var/log/nginx/error.log

# 설정 테스트
sudo nginx -t

# 재시작
sudo systemctl restart nginx
```

### 파일 권한 문제

```bash
# 권한 설정
sudo chown -R ark1st:ark1st /home/ark1st/dpbr_frontend
sudo chmod -R 755 /home/ark1st/dpbr_frontend
```

---

## 📞 문의

문제가 발생하면 GitHub Issues에 등록해주세요.
