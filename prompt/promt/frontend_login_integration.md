## 프론트/백엔드 로그인 연동 메모

- **환경변수 정리**
  - `dpbr_front/app/.env`, `.env.example`에 다음 키 추가/정리
    - `PUBLIC_API_URL=http://localhost:8001` (개발용 백엔드 주소)
    - `PUBLIC_KAKAO_CLIENT_ID` (카카오 REST API 키, 실제 값은 로컬에서 설정)
    - `PUBLIC_KAKAO_REDIRECT_URI=http://localhost:5173/auth/callback`

- **공통 API 유틸 (`src/lib/utils/api.ts`)**
  - API 베이스 URL을 `import.meta.env.VITE_API_URL` → `PUBLIC_API_URL`로 통일.
  - `apiRequest`에서:
    - 모든 요청에 토큰이 있으면 `Authorization: Bearer <token>` 헤더 추가.
    - `credentials: 'include'` 강제 설정 제거 → CORS(`Access-Control-Allow-Origin: *` + credentials) 문제 해결.
    - 응답 body가 없을 수 있어 `text()` 후 조건부 `JSON.parse`.
    - 에러 메시지는 `data.message` 또는 `data.detail` 우선 사용.
  - 로그인(`login`):
    - 엔드포인트: `POST /api/v1/users/login`.
    - 요청 형식: `application/x-www-form-urlencoded`.
    - 필드 매핑: `username = studentId`, `password = studentId`.
    - 백엔드 `Token` 응답(`access_token`)을 받아 JWT payload 파싱으로 `user { name, studentId }` 구성.
  - 로그아웃(`logout`):
    - 엔드포인트: `POST /api/v1/users/logout`.
  - 카카오 로그인(`kakaoLogin`):
    - 엔드포인트: `POST /api/v1/users/auth/kakao/login?code=...`.
    - 백엔드 응답(`is_new_user`, `register_token`, `access_token`)을 프론트 기존 구조
      (`{ registerToken }` 또는 `{ token, user }`)로 변환.
  - 카카오 회원가입 완료(`signup`):
    - 엔드포인트: `POST /api/v1/users/auth/kakao/register`.
    - 요청 body를 백엔드 스펙에 맞게 snake_case로 변환
      (`register_token`, `student_id`, `nickname`).
    - 응답 토큰으로 `user { name, studentId, nickname }` 생성.
  - 인증 확인(`verifyAuth`):
    - 별도 백엔드 호출 없이, 저장된 토큰의 JWT payload를 파싱해 `user` 재구성.

- **로그인 페이지 레이아웃/동작 (`routes/login/+page.svelte`)**
  - env 사용:
    - `$env/static/public` → `$env/dynamic/public`로 변경.
    - `env.PUBLIC_KAKAO_CLIENT_ID`, `env.PUBLIC_KAKAO_REDIRECT_URI`를 읽어 카카오 인증 URL 생성.
    - 둘 중 하나라도 없으면: 카카오 로그인 시 토스트로 오류 메시지 출력 후 중단.
  - 토스트 메시지:
    - `toastMessage` 상태 추가, `showToastMessage(message?: string)`로 에러별 메시지 설정 가능.
    - 기본 메시지: `"이름 또는 학번을 확인해 주세요."`.
  - 로그인 실패 플로우:
    - `authStore.login`에서 실패 시 예외 발생 → `handleLogin`의 `catch`에서 토스트 표시, 학번 초기화 및 포커스.
    - `finally`에서 항상 `isLoading = false`로 버튼 상태 복구.
  - 레이아웃 수정:
    - 루트 컨테이너: `flex flex-col min-h-screen` 구조로 변경.
    - 메인 컨텐츠: `flex-1 flex items-center justify-center`로 세로 중앙 정렬.
    - 푸터:
      - 기존: `position: fixed` + `bottom-[80px]` → 화면 높이 변화 시 위아래로 움직이는 문제.
      - 변경: 일반 흐름(`mt-8`, `flex justify-center`, `text-center`)으로 배치해 안정적인 하단 고정 느낌만 유지.

- **기타**
  - 카카오 관련 전체 플로우:
    - 로그인 화면에서 카카오 버튼 클릭 → 카카오 인증 페이지 → `PUBLIC_KAKAO_REDIRECT_URI`로 리다이렉트
      (`/auth/callback?code=...`) → 프론트에서 `code` 추출 후 `kakaoLogin` 호출 →
      기존 유저면 토큰 발급 후 메인 이동, 신규 유저면 `registerToken` 저장 후 `/auth/signup`으로 이동.

