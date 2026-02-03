# MSGS_13_F - 단풍바람 메생결산

메이플스토리 동아리 "단풍바람"의 13기 메생(메이플스토리 생활) 결산 시스템입니다.

## 📚 문서 가이드

### 🎯 필수 문서
- 🚀 **[빠른 시작 가이드](./QUICK_REFERENCE.md)** - 자주 쓰는 명령어와 규칙 (먼저 읽기!)
- 📖 **[인수인계 문서](./HANDOVER.md)** - 초보 개발자를 위한 상세 가이드
- 📐 **[개발 컨벤션](./CONVENTIONS.md)** - AI 기반 개발 규칙 및 협업 방법

### 🤖 AI 개발 도구
- 🌐 **[브라우저 기반 테스트](./BROWSER_TESTING.md)** - AI가 브라우저를 조작하며 자동 테스트하는 방법

### 📋 템플릿
- 📝 **[이슈 템플릿](./.github/ISSUE_TEMPLATE/)** - 기능 요청, 버그 리포트, 문서 작업
- 🔀 **[PR 템플릿](./.github/PULL_REQUEST_TEMPLATE.md)** - Pull Request 작성 가이드

## 📋 프로젝트 소개

단풍바람 동아리원들의 메이플스토리 활동 내역과 주요 업적을 기록하고 공유하는 웹 애플리케이션입니다. 동아리원들의 프로필, 달성한 업적, 그리고 소통할 수 있는 댓글 기능을 제공합니다.

## 🚀 주요 기능

- **동아리원 프로필**: 캐릭터 정보 (레벨, 직업, 서버)
- **메생결산 기록**: 주요 업적 및 활동 내역 관리
- **이미지 저장**: 결산 내용을 이미지로 저장 및 공유
- **댓글 시스템**: 동아리원 간 소통 및 응원 메시지
- **반응형 디자인**: 모바일 및 데스크톱 최적화

## 🛠️ 기술 스택

- **Framework**: [SvelteKit](https://kit.svelte.dev/) 2.0 + [Svelte 5](https://svelte.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) 5.0
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) 4.0
- **Icons**: [Lucide Svelte](https://lucide.dev/)
- **Image Export**: [html-to-image](https://github.com/bubkoo/html-to-image)
- **Build Tool**: [Vite](https://vitejs.dev/) 6.0

## 📁 프로젝트 구조

```
dpbr_2026/
└── dpbr_front/
    └── app/
        ├── src/
        │   ├── lib/
        │   │   ├── components/     # 재사용 가능한 컴포넌트
        │   │   │   ├── CharacterCard.svelte
        │   │   │   ├── CommentItem.svelte
        │   │   │   ├── Header.svelte
        │   │   │   ├── SettlementListItem.svelte
        │   │   │   └── Sidebar.svelte
        │   │   ├── data.ts         # 데이터 모델 및 함수
        │   │   └── types.ts        # TypeScript 타입 정의
        │   └── routes/
        │       ├── +layout.svelte  # 레이아웃
        │       ├── +page.svelte    # 메인 페이지
        │       ├── member/[id]/    # 멤버 상세 페이지
        │       ├── msg/[id]/       # 메시지 상세 페이지
        │       └── talk/           # 댓글 페이지
        ├── package.json
        └── vite.config.ts
```

## 🚦 시작하기

### 사전 요구사항

- Node.js 20.x 이상
- npm 또는 yarn

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone git@github.com:GC-MapleWind/MSGS_13_F.git
   cd MSGS_13_F
   ```

2. **의존성 설치**
   ```bash
   cd dpbr_front/app
   npm install
   ```

3. **개발 서버 실행**
   ```bash
   npm run dev
   ```
   
   브라우저에서 `http://localhost:5173` 접속

### 빌드

프로덕션 빌드를 생성하려면:

```bash
npm run build
```

빌드된 앱을 미리보기:

```bash
npm run preview
```

## 📝 스크립트

```json
{
  "dev": "vite dev",              // 개발 서버 실행
  "build": "vite build",          // 프로덕션 빌드
  "preview": "vite preview",      // 빌드 결과 미리보기
  "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json"  // 타입 체크
}
```

## 🎨 페이지 구조

- **/** - 동아리원 목록 (메인)
- **/member/[id]** - 동아리원 상세 정보 및 메생결산 목록
- **/member/[id]/save** - 메생결산 이미지 저장 페이지
- **/msg/[id]** - 개별 메생결산 상세 보기
- **/talk** - 동아리 게시판 (댓글)

## 🎯 데이터 타입

### Character
```typescript
{
  id: string;
  name: string;
  nickname: string;
  avatarUrl: string;
  level: number;
  job: string;
  club: string;      // 동아리명
  server: string;
}
```

### SettlementItem
```typescript
{
  id: string;
  characterId: string;
  title: string;
  description: string;
  imageUrl: string;
  acquiredAt: string;
}
```

### TalkComment
```typescript
{
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}
```

## 🤝 기여하기

이 프로젝트는 단풍바람 동아리를 위한 프로젝트입니다. 버그 리포트나 기능 제안은 이슈로 등록해주세요.

## 📄 라이선스

이 프로젝트는 Private 프로젝트입니다.

## 👥 개발자

단풍바람 동아리 13기

---

**Made with ❤️ for 단풍바람 Club**
