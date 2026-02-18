# 🍁 단풍바람 메생결산 프로젝트 인수인계 문서

> 초보 개발자를 위한 상세 가이드

---

## 📌 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [개발 과정 - 바이브코딩이란?](#2-개발-과정---바이브코딩이란)
3. [현재 완성된 내용](#3-현재-완성된-내용)
4. [기술 스택 및 프로젝트 구조](#4-기술-스택-및-프로젝트-구조)
5. [개발 환경 설정](#5-개발-환경-설정)
6. [앞으로 개발하는 방법](#6-앞으로-개발하는-방법)
7. [주요 파일 설명](#7-주요-파일-설명)
8. [트러블슈팅](#8-트러블슈팅)

---

## 1. 프로젝트 개요

### 📱 프로젝트명
**MSGS_13_F** - 단풍바람 동아리 13기 메생결산 시스템

### 🎯 목적
메이플스토리 동아리 "단풍바람"의 회원들이 자신의 게임 활동(메생 = 메이플스토리 생활)을 기록하고 공유하는 웹 애플리케이션입니다.

### 🌟 핵심 기능
- 동아리원 프로필 관리
- 메생결산(업적) 기록 및 조회
- 카드 이미지로 저장 기능
- 동아리원 간 소통 (댓글 시스템)
- 모바일 최적화 반응형 디자인

---

## 2. 개발 과정 - 바이브코딩이란?

### 🤖 바이브코딩(Vibe Coding)이란?
**AI와 대화하듯이 코드를 작성하는 새로운 개발 방식**입니다.

전통적인 개발:
```
개발자가 직접 코드를 한 줄씩 타이핑 → 컴파일 → 테스트 → 디버깅
```

바이브코딩:
```
개발자가 AI에게 자연어로 요청 → AI가 코드 생성 → 즉시 테스트 → 피드백
```

### 💡 이 프로젝트에서 사용한 바이브코딩 도구

#### 1. **Cursor (현재 환경)**
- Windows 환경에서 사용
- ChatGPT 같은 대화형 AI가 IDE에 내장
- 코드 자동 생성, 수정, 설명 제공

#### 2. **Claude Code (WSL Ubuntu 환경)**
- WSL Ubuntu 환경에서 사용
- 터미널에서 AI와 대화하며 개발
- `.claude/settings.local.json`에 권한 설정 저장

### 🎨 실제 개발 과정

#### Phase 1: 기획서 작성 (AI와 함께)
```
개발자: "메이플스토리 동아리 결산 앱을 만들고 싶어. 모바일 퍼스트로."
AI: "다음과 같은 기획서를 만들었습니다..." → plan.md 생성
```

#### Phase 2: 프로젝트 초기 설정
```
개발자: "SvelteKit으로 프로젝트 생성해줘"
AI: npx create-svelte@latest app 실행
    → Tailwind CSS 4.0 설치
    → TypeScript 설정
```

#### Phase 3: 컴포넌트 개발
```
개발자: "캐릭터 카드 컴포넌트 만들어줘. 3열 그리드로."
AI: CharacterCard.svelte 생성
    → 그라데이션 배경
    → 반응형 레이아웃
    → 클릭 이벤트 처리
```

#### Phase 4: 페이지 구현
```
개발자: "멤버 상세 페이지 만들어줘"
AI: /member/[id]/+page.svelte 생성
    → 동적 라우팅 설정
    → 데이터 바인딩
    → 리스트 렌더링
```

#### Phase 5: 데이터 구조화
```
개발자: "더미 데이터 넣어줘"
AI: lib/data.ts에 샘플 데이터 추가
    → characters 배열
    → settlementItems 배열
    → talkComments 배열
```

#### Phase 6: 추가 기능
```
개발자: "카드를 이미지로 저장할 수 있게 해줘"
AI: html-to-image 라이브러리 설치
    → /member/[id]/save 페이지 생성
    → 다운로드 기능 구현
```

### 🔄 반복적인 개선 과정

```
1. 요청: "길드를 동아리로 바꿔줘"
   → AI가 모든 파일에서 'guild' → 'club' 자동 변경

2. 요청: "하드코딩된 값들 제거해줘"
   → AI가 코드를 분석하고 데이터 파일로 분리

3. 요청: "README 작성해줘"
   → AI가 프로젝트 구조 분석 후 문서 자동 생성
```

---

## 3. 현재 완성된 내용

### ✅ 완성된 페이지

#### 1. 메인 페이지 (`/`)
- 3열 그리드 캐릭터 카드
- 헤더 (로고, 메뉴 버튼, 톡 버튼)
- 사이드바 (슬라이드 메뉴)

#### 2. 멤버 상세 페이지 (`/member/[id]`)
- 캐릭터 정보 표시
- 메생결산 목록
- 저장 버튼

#### 3. 메생결산 상세 (`/msg/[id]`)
- 이미지 크게 보기
- 획득 일자 및 상세 내용
- 닫기 버튼

#### 4. 이미지 저장 페이지 (`/member/[id]/save`)
- 캐릭터 카드 미리보기
- PNG 다운로드 기능
- 닫기 및 저장 버튼

#### 5. 톡 페이지 (`/talk`)
- 댓글 목록
- 댓글 입력창
- 스크롤 기능

### 🎨 완성된 컴포넌트

```
src/lib/components/
├── CharacterCard.svelte       # 캐릭터 카드 (3열 그리드용)
├── Header.svelte              # 헤더 (여러 variant 지원)
├── Sidebar.svelte             # 사이드 메뉴
├── SettlementListItem.svelte  # 메생결산 목록 아이템
└── CommentItem.svelte         # 댓글 아이템
```

### 📊 데이터 구조

```typescript
// lib/types.ts
- Character: 캐릭터 정보
- SettlementItem: 메생결산 아이템
- TalkComment: 댓글

// lib/data.ts
- characters: 9명의 샘플 캐릭터
- settlementItems: 5개의 샘플 결산
- talkComments: 8개의 샘플 댓글
- 헬퍼 함수들 (getCharacterById, getSettlementsByCharacterId 등)
```

---

## 4. 기술 스택 및 프로젝트 구조

### 🛠️ 기술 스택

```json
{
  "프레임워크": "SvelteKit 2.0 + Svelte 5",
  "언어": "TypeScript 5.0",
  "스타일링": "Tailwind CSS 4.0",
  "아이콘": "Lucide Svelte",
  "이미지 변환": "html-to-image",
  "빌드 도구": "Vite 6.0"
}
```

### 📁 프로젝트 구조

```
dpbr_2026/
├── README.md                    # 프로젝트 설명
├── HANDOVER.md                  # 이 문서!
├── .gitignore                   # Git 제외 파일
└── dpbr_front/
    ├── .claude/                 # Claude AI 설정
    │   └── settings.local.json  # 권한 설정
    ├── plan.md                  # 원본 기획서
    ├── template/                # 초기 HTML 프로토타입
    └── app/                     # 실제 애플리케이션
        ├── package.json         # 의존성 관리
        ├── vite.config.ts       # Vite 설정
        ├── svelte.config.js     # Svelte 설정
        ├── tsconfig.json        # TypeScript 설정
        └── src/
            ├── app.html         # HTML 템플릿
            ├── app.css          # 글로벌 스타일
            ├── lib/             # 라이브러리
            │   ├── components/  # 재사용 컴포넌트
            │   ├── types.ts     # 타입 정의
            │   └── data.ts      # 더미 데이터
            └── routes/          # 페이지 라우팅
                ├── +layout.svelte
                ├── +page.svelte
                ├── member/[id]/
                ├── msg/[id]/
                └── talk/
```

---

## 5. 개발 환경 설정

### 🖥️ 필요한 도구

1. **Node.js** (v20 이상)
   - [다운로드](https://nodejs.org/)

2. **Git**
   - [다운로드](https://git-scm.com/)

3. **코드 에디터** (선택)
   - Cursor (AI 기능 내장) - 추천!
   - VS Code
   - WebStorm

### 🚀 프로젝트 실행 방법

#### 1. 저장소 클론
```bash
git clone https://github.com/GC-MapleWind/MSGS_13_F.git
cd MSGS_13_F
```

#### 2. 의존성 설치
```bash
cd dpbr_front/app
npm install
```

만약 오류가 발생하면:
```bash
# node_modules와 package-lock.json 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

#### 3. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

#### 4. 프로덕션 빌드
```bash
npm run build      # 빌드
npm run preview    # 빌드 결과 미리보기
```

---

## 6. 앞으로 개발하는 방법

### 🎯 개발 시작 전 체크리스트

- [ ] Node.js 설치 확인: `node --version`
- [ ] Git 설치 확인: `git --version`
- [ ] 프로젝트 클론 완료
- [ ] `npm install` 성공
- [ ] `npm run dev` 실행 확인

### 💻 바이브코딩으로 개발하기

#### 방법 1: Cursor 사용 (추천)

1. **Cursor 설치**
   - [https://cursor.sh](https://cursor.sh) 방문
   - 다운로드 및 설치

2. **프로젝트 열기**
   ```
   File → Open Folder → dpbr_2026 선택
   ```

3. **AI와 대화하기**
   - `Ctrl+L` (또는 `Cmd+L`) - AI 채팅 열기
   - 자연어로 요청하기

   ```
   예시 요청들:

   "캐릭터 카드에 호버 효과 추가해줘"
   "멤버 상세 페이지에 정렬 기능 넣어줘"
   "댓글 작성 시간을 상대시간으로 바꿔줘 (예: 3시간 전)"
   "다크모드 토글 버튼 만들어줘"
   ```

4. **코드 수정 요청**
   - 파일을 열고 `Ctrl+K` (Cmd+K)
   - 선택한 코드에 대해 수정 요청

#### 방법 2: 직접 코딩

1. **새 컴포넌트 만들기**
```svelte
<!-- src/lib/components/MyComponent.svelte -->
<script lang="ts">
  // TypeScript 코드
  let count = $state(0);
</script>

<!-- HTML 템플릿 -->
<button onclick={() => count++}>
  클릭 수: {count}
</button>

<!-- 스타일 -->
<style>
  button {
    /* Tailwind 권장 */
  }
</style>
```

2. **새 페이지 추가**
```
src/routes/my-page/+page.svelte 생성
→ 자동으로 /my-page URL 생성됨
```

3. **데이터 수정**
```typescript
// src/lib/data.ts에서 더미 데이터 수정
export const characters = [
  // 새 캐릭터 추가
  {
    id: 'char-10',
    name: '홍길동',
    // ...
  }
];
```

### 🔄 개발 워크플로우

```
1. 기능 구상
   ↓
2. AI에게 요청 (또는 직접 코딩)
   ↓
3. 브라우저에서 확인 (Hot Reload 자동)
   ↓
4. 마음에 들지 않으면 수정 요청
   ↓
5. 완성되면 Git 커밋
```

### 📝 Git 사용법

```bash
# 현재 변경사항 확인
git status

# 변경사항 스테이징
git add .

# 커밋
git commit -m "Add: 다크모드 토글 기능"

# 푸시 (GitHub에 업로드)
git push origin main
```

### 🎨 디자인 수정하기

Tailwind CSS 사용법:
```svelte
<!-- 기존 -->
<div class="bg-blue-500 text-white p-4">

<!-- 색상 변경 -->
<div class="bg-red-500 text-white p-4">

<!-- 크기 변경 -->
<div class="bg-blue-500 text-white p-8">

<!-- 반응형 -->
<div class="bg-blue-500 md:bg-green-500 text-white p-4">
     <!-- 모바일: 파란색, 태블릿 이상: 초록색 -->
```

[Tailwind CSS 문서](https://tailwindcss.com/docs) 참고

---

## 7. 주요 파일 설명

### 📄 설정 파일

#### `package.json`
```json
{
  "scripts": {
    "dev": "vite dev",        // 개발 서버
    "build": "vite build",    // 프로덕션 빌드
    "preview": "vite preview" // 빌드 미리보기
  }
}
```

#### `vite.config.ts`
- Vite 빌드 도구 설정
- Svelte 플러그인 설정
- Tailwind CSS 설정

#### `svelte.config.js`
- SvelteKit 설정
- 어댑터 설정 (배포 방식)

#### `tsconfig.json`
- TypeScript 컴파일 옵션
- 경로 alias 설정 (`$lib` → `src/lib`)

### 📄 핵심 코드 파일

#### `src/lib/types.ts`
```typescript
// 타입 정의만 모아둔 파일
export interface Character { ... }
export interface SettlementItem { ... }
export interface TalkComment { ... }
```

#### `src/lib/data.ts`
```typescript
// 실제 데이터 + 헬퍼 함수
export const characters = [...];
export function getCharacterById(id: string) { ... }
```

#### `src/routes/+layout.svelte`
```svelte
<!-- 모든 페이지에 공통으로 적용되는 레이아웃 -->
<slot />  <!-- 자식 페이지가 여기에 렌더링됨 -->
```

#### `src/routes/+page.svelte`
```svelte
<!-- 메인 페이지 (/) -->
<!-- 캐릭터 그리드 표시 -->
```

---

## 8. 트러블슈팅

### 🐛 자주 발생하는 문제

#### 1. `npm install` 실패
```bash
# 해결 방법
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### 2. 포트 충돌 (Port already in use)
```bash
# 5173 포트가 사용 중일 때
# → Vite가 자동으로 5174로 변경함
# 또는 수동으로 포트 지정:
npm run dev -- --port 3000
```

#### 3. WSL에서 npm 명령어 느림
```bash
# Windows 파일시스템 대신 WSL 파일시스템 사용
# /mnt/d/ 대신 /home/user/ 에 프로젝트 배치
```

#### 4. Git Push 실패 (Permission denied)
```bash
# SSH 키 문제 → HTTPS 사용
git remote set-url origin https://github.com/GC-MapleWind/MSGS_13_F.git
git push -u origin main
# GitHub 계정 로그인 필요
```

#### 5. Hot Reload 작동 안 함
```bash
# Vite 재시작
Ctrl+C (서버 종료)
npm run dev (재시작)
```

#### 6. TypeScript 오류
```bash
# 타입 체크
npm run check

# node_modules/@types 재설치
rm -rf node_modules
npm install
```

### 🔍 디버깅 팁

1. **브라우저 개발자 도구 사용**
   - `F12` 또는 `Ctrl+Shift+I`
   - Console 탭에서 에러 확인

2. **Svelte Inspector**
   ```
   개발 서버 실행 중
   → 브라우저에서 요소 우클릭
   → "Inspect Element (Svelte)"
   ```

3. **로그 확인**
   ```typescript
   console.log('디버깅:', someVariable);
   ```

---

## 🎓 학습 자료

### Svelte / SvelteKit
- [Svelte 공식 튜토리얼](https://learn.svelte.dev/)
- [SvelteKit 문서](https://kit.svelte.dev/docs)

### TypeScript
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/handbook/intro.html)

### Tailwind CSS
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [Tailwind Playground](https://play.tailwindcss.com/)

### Git
- [Pro Git 책 (무료)](https://git-scm.com/book/ko/v2)
- [Git 간단 가이드](https://rogerdudler.github.io/git-guide/index.ko.html)

---

## 📞 도움이 필요할 때

### AI 활용
1. **Cursor AI**
   - 프로젝트 내에서 `Ctrl+L`로 질문

2. **ChatGPT**
   - 코드 조각과 함께 질문
   - "SvelteKit에서 동적 라우팅하는 방법 알려줘"

3. **Claude.ai**
   - 긴 코드 분석에 유용
   - "이 코드가 뭘 하는지 설명해줘"

### 커뮤니티
- [Svelte Discord](https://svelte.dev/chat)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/svelte)
- [Reddit r/sveltejs](https://www.reddit.com/r/sveltejs/)

---

## ✅ 다음 단계 추천

### Phase 1: 익숙해지기
- [ ] 프로젝트 실행해보기
- [ ] 각 페이지 둘러보기
- [ ] 코드 읽어보기 (이해 안 되는 부분은 AI에게 질문)

### Phase 2: 작은 수정
- [ ] 색상 변경해보기
- [ ] 텍스트 내용 바꿔보기
- [ ] 더미 데이터 추가해보기

### Phase 3: 기능 추가
- [ ] 검색 기능
- [ ] 필터링 기능
- [ ] 정렬 기능
- [ ] 페이지네이션

### Phase 4: 백엔드 연동
- [ ] FastAPI 서버 구축
- [ ] API 엔드포인트 생성
- [ ] 프론트엔드에서 fetch로 데이터 가져오기
- [ ] 인증/로그인 기능

### Phase 5: 배포
- [ ] Vercel 또는 Netlify에 배포
- [ ] 도메인 연결
- [ ] HTTPS 설정

---

## 🎉 마무리

이 프로젝트는 **바이브코딩**으로 개발되었습니다.
즉, 대부분의 코드가 AI의 도움으로 작성되었고,
개발자는 **무엇을 만들지 설계하고 AI에게 지시하는 역할**을 했습니다.

**당신도 할 수 있습니다!**

1. AI에게 자연어로 요청하기
2. 생성된 코드 확인하고 테스트하기
3. 마음에 들지 않으면 수정 요청하기
4. 반복하기

이것이 바로 2026년의 개발 방식입니다. 🚀

---

**작성일**: 2026년 2월 2일  
**작성자**: 단풍바람 동아리 개발팀  
**문의**: 이 문서에 대한 질문은 AI에게 물어보세요!

```
Cursor에서: "HANDOVER.md의 5번 섹션 설명해줘"
```

---

**Made with ❤️ and 🤖 AI**
