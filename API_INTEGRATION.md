# API 연동 완료 안내

모든 페이지가 백엔드 API와 연동되었습니다!

## ✅ 연동 완료된 페이지

### 1. 메인 페이지 (`/`)
- **API**: `GET /api/v1/characters`
- **기능**: 캐릭터 목록 조회
- **상태**: 로딩, 에러 처리 포함

### 2. 캐릭터 상세 페이지 (`/member/[id]`)
- **API**: 
  - `GET /api/v1/characters/{id}` - 캐릭터 정보
  - `GET /api/v1/characters/{id}/settlements` - 메생결산 목록
- **기능**: 캐릭터 상세 정보 및 메생결산 목록 조회
- **상태**: 로딩, 에러 처리, 빈 목록 처리 포함

### 3. 메생결산 상세 페이지 (`/msg/[id]`)
- **API**: `GET /api/v1/settlements/{id}`
- **기능**: 메생결산 상세 정보 조회
- **상태**: 로딩, 에러 처리 포함

### 4. 댓글 페이지 (`/talk`)
- **API**: 
  - `GET /api/v1/comments` - 댓글 목록 조회
  - `POST /api/v1/comments` - 댓글 작성 (인증 필요)
- **기능**: 댓글 목록 조회 및 작성
- **상태**: 로딩, 에러 처리, 작성 중 상태 포함
- **주의**: 댓글 작성 시 더미 토큰 사용 중 (로그인 기능 구현 필요)

### 5. 카드 저장 페이지 (`/member/[id]/save`)
- **API**: `GET /api/v1/characters/{id}`
- **기능**: 캐릭터 정보를 카드 이미지로 저장
- **상태**: 로딩 처리 포함

## 🔧 기술 구현

### API 호출 유틸리티
파일: `src/lib/api.ts`

```typescript
// 사용 예시
import { getCharacters, getCharacterById } from '$lib/api';

const characters = await getCharacters();
const character = await getCharacterById('1');
```

### 환경 변수
- **개발 환경** (`.env`): `PUBLIC_API_URL=http://localhost:8000`
- **프로덕션** (`.env.production`): `PUBLIC_API_URL=/api`

### 상태 관리
모든 페이지에 다음 상태가 포함됨:
- `loading`: 데이터 로딩 중 여부
- `error`: 에러 메시지 (있을 경우)
- 데이터: 실제 API 응답 데이터

## 🚀 테스트 방법

### 1. 백엔드 API 실행
```bash
# 백엔드 프로젝트에서
uvicorn main:app --reload --port 8000
```

### 2. 백엔드 확인
브라우저에서 http://localhost:8000/docs 접속하여 API가 정상 작동하는지 확인

### 3. 프론트엔드 실행
```bash
cd dpbr_front/app
npm run dev
```

### 4. 테스트
브라우저에서 http://localhost:5173 접속 후:
1. 메인 페이지에서 캐릭터 목록이 로드되는지 확인
2. 캐릭터 카드 클릭하여 상세 페이지 확인
3. 메생결산 항목 클릭하여 상세 보기 확인
4. 댓글 페이지에서 댓글 목록 확인 및 작성 테스트

### 5. 개발자 도구 확인
- F12 → Network 탭
- API 호출이 정상적으로 되는지 확인
- 에러가 있다면 Console 탭에서 로그 확인

## ⚠️ 주의사항

### 1. 백엔드가 실행 중이어야 함
프론트엔드를 실행하기 전에 **반드시** 백엔드 API가 http://localhost:8000에서 실행 중이어야 합니다.

### 2. CORS 설정
백엔드에서 CORS를 허용해야 합니다. FastAPI의 경우:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # 개발 환경
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. 댓글 작성 인증
현재 댓글 작성 시 더미 토큰(`'dummy-token'`)을 사용합니다.
실제 로그인 기능을 구현한 후 수정이 필요합니다:

```typescript
// talk/+page.svelte의 submitComment 함수
// TODO: 실제 인증 토큰 사용
const accessToken = 'dummy-token'; // ← 이 부분 수정 필요
```

### 4. 에러 처리
모든 페이지에 기본 에러 처리가 포함되어 있지만, 
프로덕션 환경에서는 더 자세한 에러 메시지와 로깅이 필요할 수 있습니다.

## 📝 다음 단계

### 1. 로그인/인증 기능 구현
- 카카오 로그인 연동
- 일반 로그인 폼
- 토큰 저장 (localStorage 또는 cookie)
- 로그아웃 기능

### 2. 인증 상태 관리
- Svelte store로 사용자 정보 관리
- 인증이 필요한 페이지 보호
- 토큰 자동 갱신

### 3. 프로덕션 배포
- 환경 변수 설정 확인
- Nginx 프록시 설정
- Docker로 빌드 및 배포

### 4. 개선 사항
- 페이지네이션 (댓글 목록 등)
- 무한 스크롤
- 이미지 최적화
- 캐싱 전략

## 🐛 트러블슈팅

### API 연결 실패
```
Failed to load characters: TypeError: Failed to fetch
```

**원인**: 백엔드 API가 실행되지 않았거나 CORS 문제

**해결**:
1. 백엔드 실행 확인: `curl http://localhost:8000/health`
2. CORS 설정 확인
3. 환경 변수 확인: `.env` 파일의 `PUBLIC_API_URL`

### 빈 데이터
백엔드가 실행 중이지만 데이터가 없는 경우, 
백엔드 데이터베이스에 테스트 데이터를 추가해야 합니다.

### 댓글 작성 실패
```
Failed to create comment: 401 Unauthorized
```

**원인**: 인증 토큰이 유효하지 않음

**해결**: 
- 현재는 로그인 기능이 없으므로 에러 메시지가 표시됩니다
- 로그인 기능 구현 후 실제 토큰으로 교체 필요

## 📚 관련 문서

- [API 연동 가이드](./README_API.md)
- [빠른 시작](./QUICK_START.md)
- [이미지 처리 가이드](./IMAGE_GUIDE.md)
- [프로덕션 배포](./deploy/PRODUCTION_GUIDE.md)

---

**Made with ❤️ for 단풍바람 Club**
