# ⚡ 빠른 참조 가이드 (Quick Reference)

> 자주 사용하는 명령어와 규칙을 빠르게 찾아보세요!

---

## 🚀 개발 시작하기

```bash
# 1. 프로젝트 클론
git clone https://github.com/GC-MapleWind/MSGS_13_F.git
cd MSGS_13_F/dpbr_front/app

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev

# 브라우저: http://localhost:5173
```

---

## 📝 일일 작업 플로우

```bash
# 1. 최신 코드 받기
git checkout main
git pull origin main

# 2. 브랜치 생성
git checkout -b feature/13-my-feature

# 3. 개발 (AI와 함께!)
# Cursor: Ctrl+L

# 4. 브라우저 테스트 (AI에게 요청!)
# Cursor: Ctrl+L
# "방금 만든 기능을 브라우저로 테스트해줘"

# 5. 타입 체크
npm run check

# 6. 커밋
git add .
git commit -m "Add: My feature"

# 7. 푸시
git push origin feature/13-my-feature

# 8. PR 생성
# GitHub에서 Pull Request 생성
```

---

## 🎯 Prompt 템플릿

### 컴포넌트 생성
```
"[컴포넌트명] 컴포넌트를 만들어줘:

위치: src/lib/components/[이름].svelte

Props:
- [prop명]: [타입] - [설명]

기능:
- [기능 1]
- [기능 2]

스타일:
- Tailwind CSS 사용
- [색상/레이아웃 요구사항]
- 모바일 반응형"
```

### 페이지 수정
```
"[페이지명] 페이지에 [기능]을 추가해줘:

위치: src/routes/[경로]/+page.svelte

변경사항:
- [변경 1]
- [변경 2]

제약사항:
- 기존 레이아웃 유지
- TypeScript 타입 안전성"
```

### 버그 수정
```
"[파일명]에서 [버그 설명] 버그를 수정해줘:

현상:
- [현재 동작]

원인:
- [추측되는 원인]

해결책:
- [제안하는 방법]"
```

### 브라우저 테스트 🌐
```
"[기능명]을 브라우저로 테스트해줘:

확인할 것:
- [체크포인트 1]
- [체크포인트 2]
- 모바일(375px)에서도 확인
- 콘솔 에러 없는지 확인

스크린샷도 찍어줘.
문제 있으면 자동으로 수정해줘."
```

**📖 상세 가이드:** [BROWSER_TESTING.md](./BROWSER_TESTING.md)

---

## 📋 Commit Message

```bash
# 형식
git commit -m "Type: Subject"

# Types
Add      # 새 기능
Update   # 기능 개선
Fix      # 버그 수정
Refactor # 리팩토링
Style    # 포맷팅
Docs     # 문서
Test     # 테스트
Chore    # 기타

# 예시
git commit -m "Add: Character search feature"
git commit -m "Fix: Image save bug on mobile"
git commit -m "Update: Improve search performance"
```

---

## 🌿 Branch Naming

```bash
# 형식
<type>/<issue>-<description>

# 예시
feature/13-character-search
fix/42-image-upload-bug
docs/25-update-readme
refactor/99-api-layer
```

---

## 🛠️ 자주 사용하는 명령어

### NPM
```bash
npm install              # 의존성 설치
npm run dev              # 개발 서버 (포트 자동 할당)
npm run dev -- --port 3000  # 포트 지정
npm run build            # 프로덕션 빌드
npm run preview          # 빌드 미리보기
npm run check            # 타입 체크
npm outdated             # 업데이트 가능한 패키지 확인
npm audit                # 보안 취약점 확인
```

### Git - 기본
```bash
git status               # 변경사항 확인
git add .                # 모든 변경사항 스테이징
git add src/            # 특정 폴더만
git commit -m "message"  # 커밋
git push                 # 푸시
git pull                 # 풀
```

### Git - 브랜치
```bash
git branch               # 브랜치 목록
git branch feature/13    # 브랜치 생성
git checkout feature/13  # 브랜치 전환
git checkout -b feature/13  # 생성 + 전환
git branch -d feature/13    # 브랜치 삭제
```

### Git - 취소
```bash
git restore file.txt     # 파일 변경사항 취소
git restore --staged .   # 스테이징 취소
git reset --soft HEAD~1  # 커밋 취소 (변경사항 유지)
git reset --hard HEAD~1  # 커밋 취소 (변경사항 삭제) ⚠️
```

### Git - 원격
```bash
git remote -v            # 원격 저장소 확인
git fetch                # 원격 변경사항 가져오기
git pull origin main     # main 브랜치 풀
git push origin feature/13  # 브랜치 푸시
git push -u origin feature/13  # 처음 푸시할 때
```

---

## 🎨 Tailwind CSS 자주 쓰는 클래스

### 레이아웃
```
flex, grid
justify-center, items-center
gap-4
p-4, px-4, py-4, pt-4
m-4, mx-4, my-4, mt-4
w-full, h-full
max-w-lg
```

### 그리드
```
grid-cols-1        # 1열
grid-cols-2        # 2열
grid-cols-3        # 3열
md:grid-cols-2     # 중간 화면: 2열
lg:grid-cols-3     # 큰 화면: 3열
gap-4              # 간격
```

### 텍스트
```
text-sm, text-base, text-lg, text-xl
font-bold, font-semibold
text-center, text-left, text-right
text-gray-600
truncate           # 한 줄 말줄임
line-clamp-2       # 2줄 말줄임
```

### 색상
```
bg-white, bg-gray-100
text-black, text-gray-600
border-gray-300
```

### 반응형
```
sm:text-sm         # 640px 이상
md:text-base       # 768px 이상
lg:text-lg         # 1024px 이상
xl:text-xl         # 1280px 이상
```

### 상태
```
hover:bg-blue-500
focus:ring-2
active:scale-95
disabled:opacity-50
```

### 기타
```
rounded, rounded-lg, rounded-full
shadow, shadow-md, shadow-lg
opacity-50
transition
cursor-pointer
```

---

## 🔍 문제 해결 (Troubleshooting)

### "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Port already in use"
```bash
# Vite가 자동으로 다른 포트 사용 (5174, 5175...)
# 또는 수동 지정
npm run dev -- --port 3000
```

### TypeScript 에러
```bash
npm run check
```

### Git push 실패
```bash
# 권한 문제 → HTTPS 사용
git remote set-url origin https://github.com/GC-MapleWind/MSGS_13_F.git
git push
```

### Hot reload 안 됨
```bash
# 서버 재시작
Ctrl+C
npm run dev
```

### 빌드 실패
```bash
# 캐시 삭제
rm -rf .svelte-kit
npm run build
```

---

## 📂 파일 찾기

```
컴포넌트:         src/lib/components/
타입 정의:        src/lib/types.ts
더미 데이터:       src/lib/data.ts
페이지:           src/routes/
메인 페이지:       src/routes/+page.svelte
레이아웃:         src/routes/+layout.svelte
설정:            package.json, vite.config.ts
스타일:           src/app.css
```

---

## 🤖 AI 활용 팁

### Cursor 단축키
```
Ctrl+L  (Cmd+L)    # AI 채팅
Ctrl+K  (Cmd+K)    # 인라인 편집
Ctrl+I  (Cmd+I)    # 코드 설명
```

### 자주 쓰는 질문
```
"이 코드 설명해줘"
"이 함수 리팩토링해줘"
"이 컴포넌트에 PropTypes 추가해줘"
"이 페이지를 모바일에 최적화해줘"
"주석을 JSDoc 형식으로 바꿔줘"
"이 부분에 에러 핸들링 추가해줘"
```

---

## 📚 문서 링크

- [상세 인수인계 문서](./HANDOVER.md)
- [전체 컨벤션](./CONVENTIONS.md)
- [프로젝트 README](./README.md)
- [SvelteKit 문서](https://kit.svelte.dev/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🎯 체크리스트

### 개발 시작
- [ ] 최신 코드 pull
- [ ] 이슈 확인
- [ ] 브랜치 생성

### 커밋 전
- [ ] 로컬 테스트
- [ ] 타입 체크 (`npm run check`)
- [ ] 커밋 메시지 확인

### PR 전
- [ ] 모든 체크리스트 완료
- [ ] 스크린샷 첨부 (UI 변경 시)
- [ ] 관련 이슈 링크

---

## 🆘 도움이 필요하면

1. **AI에게 물어보기**
   ```
   "CONVENTIONS.md의 X 부분 설명해줘"
   "이 에러 어떻게 해결해?"
   ```

2. **문서 확인**
   - HANDOVER.md (전체 가이드)
   - CONVENTIONS.md (상세 규칙)

3. **팀원에게 질문**
   - GitHub Issues
   - PR 코멘트

---

**이 문서를 즐겨찾기하세요! ⭐**
