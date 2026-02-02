제공해주신 영상, 플로우차트, 디자인 기획서를 바탕으로 **Gemini-CLI** 등의 AI 코딩 에이전트가 바로 개발에 착수할 수 있도록 구체화된 **프론트엔드 개발 상세 기획서**를 작성해 드립니다.

---

# 🍁 프로젝트명: 단풍바람 (MapleWind) 프론트엔드 개발 기획서

## 1. 프로젝트 개요 및 환경 설정
이 문서는 메이플스토리 캐릭터들의 '메생결산(게임 인생 결산)'을 카드 형태로 보여주고, 소통하는 웹 애플리케이션의 프론트엔드 명세서입니다.

*   **프레임워크:** SvelteKit (App Router 사용)
*   **스타일링:** Tailwind CSS
*   **언어:** TypeScript
*   **타겟 디바이스:** 모바일 퍼스트 (반응형 지원: 최소 너비 320px ~ 최대 너비 768px)
*   **백엔드:** FastAPI (API 연동을 고려한 데이터 구조 설계 필요)

---

## 2. 디자인 시스템 및 공통 레이아웃 (Global Styles)

### 2.1. 컬러 팔레트 (Tailwind Config 설정 권장)
*   **Primary (테마색):** `#FFAB91` (살구색/연한 오렌지 계열 - 스크린샷 참조)
*   **Secondary:** `#FFE0B2` (카드 배경 등 연한 톤)
*   **Text:** `#333333` (기본 텍스트), `#666666` (서브 텍스트), `#999999` (날짜 등)
*   **Background:** `#FFF3E0` (앱 전체 배경), `#FFFFFF` (카드/컨텐츠 배경)

### 2.2. 레이아웃 (Layout Wrapper)
모든 페이지는 중앙 정렬된 모바일 뷰포트를 유지해야 합니다.
*   **Container:** `min-h-screen bg-[#FFF3E0] flex justify-center`
*   **App Wrapper:** `w-full max-w-[768px] min-w-[320px] bg-white shadow-lg relative min-h-screen flex flex-col`
*   **Font:** 한글 폰트 (Pretendard 또는 Noto Sans KR 권장)

---

## 3. 라우트 구조 (SvelteKit Directory Structure)

```text
src/routes/
├── +layout.svelte       # 전체 레이아웃 (헤더, 사이드바 상태 관리)
├── +page.svelte         # [1. 메인 페이지] 캐릭터 목록 그리드
├── talk/
│   └── +page.svelte     # [5. 톡 페이지] 방명록/댓글
├── member/
│   └── [id]/
│       ├── +page.svelte # [2. 멤버 상세 페이지] 메생결산 리스트
│       └── save/
│           └── +page.svelte # [4. 이미지 저장 페이지]
└── msg/
    └── [id]/
        └── +page.svelte # [3. 결산 상세 페이지] (Modal 혹은 별도 페이지)
```

---

## 4. 페이지별 상세 명세 (Specs)

### 1. 메인 페이지 (Main Page)
**URL:** `/`

*   **Header (Fixed Top):**
    *   **Left:** 햄버거 메뉴 아이콘 (클릭 시 Sidebar 오픈)
    *   **Center:** 로고/텍스트 "단풍바람"
    *   **Right:** 말풍선 아이콘 (클릭 시 `/talk` 이동)
*   **Content:**
    *   **Layout:** 3열 그리드 (`grid-cols-3`), `gap-2` 또는 `gap-4`.
    *   **Item (Character Card):**
        *   정사각형에 가까운 비율.
        *   배경: 옅은 파스텔톤 그라데이션 또는 단색.
        *   내용: 캐릭터 아바타 이미지 (중앙), 캐릭터 이름 (하단), 직업/정보 (이름 아래 작게).
        *   **Action:** 클릭 시 `/member/[character_id]`로 이동.
*   **Sidebar (Component):**
    *   왼쪽에서 슬라이드 인 (Overlay 포함).
    *   **Menu Items:**
        1.  메생결산 소식 (Home과 동일 기능 혹은 필터링)
        2.  운영팀 한마디 (별도 데이터 리스트 뷰)
    *   활성화된 메뉴 하이라이트 처리.

### 2. 멤버 상세 페이지 (Member Page / MSGS List)
**URL:** `/member/[id]`

*   **Header:**
    *   **Left:** 뒤로가기 (<) 아이콘.
    *   **Center:** 캐릭터 이름 및 정보 (레벨, 직업, 길드 등).
        *   예: `강민아 담와` / `Lv. 265 · 이브리스 · 아크`
    *   **Right:** '저장' 버튼 (텍스트 혹은 아이콘). 클릭 시 `/member/[id]/save` 이동.
*   **Content (List):**
    *   **Title:** "획득한 메생결산 목록"
    *   **List Item:**
        *   **Left:** 썸네일 이미지 (Rounded Square).
        *   **Right:**
            *   제목 (Bold, 말줄임표 처리 `text-ellipsis`).
            *   획득 날짜 (예: `2026년 8월 30일 획득`).
    *   **Scroll:** 무한 스크롤 또는 전체 리스트 렌더링.
    *   **Action:** 아이템 클릭 시 `/msg/[msg_id]` (상세 페이지)로 이동.

### 3. 결산 상세 페이지 (MSGS Detail Page)
**URL:** `/msg/[msg_id]` (또는 `/member/[id]/detail/[msg_id]`)
*   *참고: 디자인상 팝업처럼 보이나, 모바일 UX를 위해 전체 페이지 덮어쓰기 또는 Full-screen Modal 형태 권장.*

*   **Header:**
    *   **Right:** 닫기 (X) 아이콘 (클릭 시 이전 페이지로 복귀).
*   **Content:**
    *   **Main Image:** 상단에 꽉 차게 혹은 여백을 두고 크게 배치.
    *   **Info:**
        *   **획득 일자:** `Label: 획득 일자`, `Value: 2026년 8월 1일`
        *   **상세 내용:** 텍스트 박스.
            *   내용이 길 경우 자동 줄바꿈.
            *   디자인: 회색 배경 박스 (`bg-gray-50`) 안에 텍스트 배치.

### 4. 이미지 저장 페이지 (Character Image Save Page)
**URL:** `/member/[id]/save`

*   **UI:**
    *   전체 화면 어두운 배경 (Overlay 느낌).
    *   **Card Preview:** 화면 중앙에 모바일 비율(세로형)의 카드 이미지가 렌더링됨.
        *   포함 요소: 캐릭터 아바타, 이름, 주요 스탯/정보 등 (팬카드 형태).
    *   **Header:** 우측 상단 닫기(X) 버튼.
    *   **Footer:** 하단 고정 '저장하기' 버튼 (아이콘 + 텍스트).
*   **Function:**
    *   '저장하기' 버튼 클릭 시, 해당 카드 영역을 이미지(PNG/JPG)로 다운로드.
    *   *구현 팁:* `html2canvas` 또는 `dom-to-image` 라이브러리 활용 예상.

### 5. 메생결산 톡 (MSGS Talk)
**URL:** `/talk`

*   **Header:**
    *   **Left:** 뒤로가기 (<).
    *   **Center:** "메생결산 톡".
    *   **Sub:** 댓글 수 (예: `톡 3`).
*   **Content (Comment List):**
    *   스크롤 가능한 댓글 리스트.
    *   **Comment Item:**
        *   **Avatar:** 원형 프로필 이미지 (랜덤 또는 유저).
        *   **Info:** 닉네임, 작성일시 (YY.MM.DD HH:mm).
        *   **Text:** 댓글 내용. 긴 내용은 "더보기" 없이 전체 출력하거나 디자인 가이드에 따름 (디자인상 스크롤).
*   **Footer (Input Area):**
    *   화면 하단 고정 (`sticky` or `fixed bottom`).
    *   **Component:**
        *   Textarea (내용 입력).
        *   Placeholder: "댓글을 남겨 보세요."
        *   Send Button (종이비행기 아이콘).
    *   **Interaction:**
        *   텍스트 입력 시 높이 자동 조절 (최소 1줄 ~ 최대 4.5줄, 그 이후엔 내부 스크롤).
        *   키보드 올라올 때 뷰포트 리사이징 대응.

---

## 5. 데이터 모델 (TypeScript Interfaces 예시)

개발 시 사용할 더미 데이터 구조입니다.

```typescript
// 캐릭터 정보
interface Character {
  id: string;
  name: string;
  avatarUrl: string;
  level: number;
  job: string;
  guild: string;
  server: string;
}

// 메생결산 아이템 (업적)
interface SettlementItem {
  id: string;
  characterId: string;
  title: string;
  description: string; // 상세 내용
  imageUrl: string;
  acquiredAt: string; // "2026-08-30"
}

// 톡(댓글)
interface TalkComment {
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  createdAt: string; // "26. 01. 22. 23:11"
}
```

---

## 6. 개발 지침 (Prompt Context)

AI에게 코드를 요청할 때 다음 사항을 강조해 주세요.

1.  **반응형 레이아웃:** `tailwind.config.js` 등을 수정하지 않고 유틸리티 클래스 위주로 작성하되, `max-w-[768px]` 래퍼를 `src/routes/+layout.svelte`에 적용하여 모든 페이지가 모바일 뷰처럼 보이게 할 것.
2.  **컴포넌트 분리:** 반복되는 요소(예: `CharacterCard`, `SettlementListItem`, `Header`)는 `src/lib/components/` 디렉토리에 분리하여 작성할 것.
3.  **아이콘:** `lucide-svelte` 또는 `svelte-icons` 라이브러리를 사용하여 햄버거 메뉴, 뒤로가기, 톡 아이콘 등을 구현할 것.
4.  **더미 데이터:** 백엔드 연동 전이므로, `src/lib/data.ts` 파일을 만들어 더미 데이터를 export 하여 UI를 확인할 수 있게 할 것.
5.  **애니메이션:** Svelte의 `transition` (fade, fly, slide)을 사용하여 사이드바 오픈, 페이지 전환 시 부드러운 효과를 줄 것.

