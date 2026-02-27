# 빠른 시작 가이드

## 개발 환경 (npm 사용)

### 1. 백엔드 API 실행

백엔드 프로젝트를 먼저 실행합니다 (http://localhost:8000에서 실행되어야 함):

```bash
# 백엔드 프로젝트 디렉토리에서
uvicorn main:app --reload --port 8000
```

API 문서 확인: http://localhost:8000/docs

### 2. 프론트엔드 개발 서버 실행

```bash
# 프로젝트 루트에서
cd dpbr_front/app

# 의존성 설치 (처음 한 번만)
npm install

# 환경 변수 설정 (처음 한 번만)
cp .env.example .env

# 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:5173 접속

### 3. 개발하기

- 코드를 수정하면 자동으로 새로고침됩니다 (Hot Reload)
- API 호출은 자동으로 http://localhost:8000으로 연결됩니다
- 브라우저 개발자 도구에서 네트워크 탭을 확인하세요

---

## npm 명령어

```bash
# 개발 서버 실행 (Hot Reload)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 타입 체크
npm run check
```

---

## Docker 사용 (프로덕션/배포용)

### 개발 환경 테스트

```bash
# 프로젝트 루트에서
docker-compose -f docker-compose.dev.yml up -d

# 접속: http://localhost:3000
```

### 통합 환경 (Nginx 프록시 포함)

```bash
docker-compose up -d --build

# 접속: http://localhost
# API 문서: http://localhost/docs
```

---

## 트러블슈팅

### 1. API 연결 안 됨

**확인사항**:
```bash
# 백엔드 API 실행 확인
curl http://localhost:8000/health

# 또는 브라우저에서
# http://localhost:8000/docs
```

**해결방법**: 백엔드 API를 먼저 실행하세요

### 2. 포트 충돌

**증상**: `Port 5173 is already in use` 또는 Vite가 자동으로 `5174`로 변경됨

**해결방법**:
```bash
# 기본 실행
npm run dev
```

`npm run dev` 실행 시 predev 스크립트가 `5173`의 기존 Vite 프로세스를 자동 정리합니다.  
다른 프로그램이 `5173`을 점유 중이면 안전을 위해 실패하며, 점유 프로세스를 먼저 종료해야 합니다.  
또한 종료 직전에 PID를 다시 확인해 Vite가 아닌 프로세스는 종료하지 않습니다.
강제 종료(SIGKILL) 폴백은 기본 비활성화이며, 필요 시 `FRONTEND_FORCE_KILL=1`과 `FRONTEND_FORCE_KILL_CONFIRM=YES`를 함께 설정해야 동작합니다.

### 3. 백엔드 바인드 충돌

**증상**: `uvicorn` 실행 시 `[Errno 98] address already in use` (`0.0.0.0:8000`)

**해결방법**:
```bash
# 이미 실행 중인 백엔드를 재사용할 수 있으면 재사용
curl http://127.0.0.1:8000/health

# 점유 프로세스 확인 (macOS/Linux)
lsof -iTCP:8000 -sTCP:LISTEN
```

프론트엔드의 predev 스크립트는 `8000` 포트를 종료하지 않고 상태만 안내합니다.

### 4. 모듈을 찾을 수 없음

**증상**: `Cannot find module` 에러

**해결방법**:
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 5. 환경 변수 안 됨

**증상**: API 호출이 안 됨, `PUBLIC_API_URL` 에러

**해결방법**:
```bash
# .env 파일 확인
cat .env

# 없으면 생성
cp .env.example .env

# 내용 확인
# PUBLIC_API_URL=http://localhost:8000
```

---

## 개발 워크플로우

### 일반적인 개발 순서

1. **백엔드 실행**
   ```bash
   # 백엔드 프로젝트에서
   uvicorn main:app --reload --port 8000
   ```

2. **프론트엔드 실행**
   ```bash
   # dpbr_front/app에서
   npm run dev
   ```

3. **코드 수정**
   - `src/` 디렉토리에서 파일 수정
   - 저장하면 자동으로 브라우저 새로고침

4. **API 테스트**
   - 브라우저 개발자 도구 (F12)
   - Network 탭에서 API 호출 확인

### 새로운 기능 개발 시

1. **타입 정의** (`src/lib/types.ts`)
2. **API 함수 추가** (`src/lib/api.ts`)
3. **컴포넌트 작성** (`src/lib/components/`)
4. **페이지 라우팅** (`src/routes/`)

---

## VS Code 추천 확장 프로그램

- **Svelte for VS Code** - Svelte 문법 지원
- **Tailwind CSS IntelliSense** - Tailwind 자동완성
- **ESLint** - 코드 린팅
- **Prettier** - 코드 포맷팅

---

## 참고 문서

- [API 연동 가이드](./README_API.md)
- [프로덕션 배포](./deploy/PRODUCTION_GUIDE.md)
- [메인 README](./README.md)
