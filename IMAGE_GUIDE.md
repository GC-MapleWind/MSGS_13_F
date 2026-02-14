# 이미지 처리 가이드

## 📸 기본 이미지 설정

백엔드 API에서 이미지 URL이 제공되지 않을 때 기본 이미지를 사용하도록 설정되어 있습니다.

### 기본 이미지 위치

```
dpbr_front/app/static/default-avatar.png
```

이 이미지는 다음 경우에 자동으로 사용됩니다:
- 캐릭터 아바타 이미지가 없을 때
- 메생결산 이미지가 없을 때
- 댓글 작성자 아바타 이미지가 없을 때
- 이미지 로드에 실패했을 때

## 🔧 구현 방식

### 1. API 응답 처리 (`src/lib/api.ts`)

백엔드에서 `null` 또는 빈 문자열이 오면 자동으로 기본 이미지 경로로 변경:

```typescript
// 백엔드 응답
{
  avatar_url: null  // 또는 ""
}

// 프론트엔드 변환
{
  avatarUrl: '/default-avatar.png'
}
```

### 2. 이미지 에러 처리 (`src/lib/utils/image.ts`)

이미지 로드 실패 시 자동으로 기본 이미지로 대체:

```typescript
import { handleImageError } from '$lib/utils/image';

<img 
  src={imageUrl} 
  onerror={handleImageError}
  alt="..."
/>
```

## 📝 적용된 컴포넌트

### 1. CharacterCard.svelte
- 캐릭터 카드의 아바타 이미지
- 위치: 메인 페이지 캐릭터 그리드

### 2. SettlementListItem.svelte  
- 메생결산 썸네일 이미지
- 위치: 캐릭터 상세 페이지의 메생결산 목록

### 3. 캐릭터 상세 페이지 (`/member/[id]`)
- 상단 캐릭터 프로필 이미지

### 4. 메생결산 상세 페이지 (`/msg/[id]`)
- 메생결산 메인 이미지

### 5. 카드 저장 페이지 (`/member/[id]/save`)
- 저장할 카드의 캐릭터 이미지

### 6. 댓글 페이지 (`/talk`)
- 댓글 작성자 아바타 (현재는 모두 기본 이미지 사용)

## 🎨 기본 이미지 변경하기

다른 이미지로 변경하려면:

### 방법 1: 파일 교체

```bash
# static 폴더의 파일을 직접 교체
cp new-image.png dpbr_front/app/static/default-avatar.png
```

### 방법 2: 새 파일 사용

1. 새 이미지를 `static/` 폴더에 추가
   ```bash
   cp new-default.png dpbr_front/app/static/
   ```

2. `src/lib/utils/image.ts` 수정
   ```typescript
   const DEFAULT_AVATAR = '/new-default.png';
   ```

## 🔄 동작 과정

### 1. API 호출 시
```
백엔드 API 응답
  ↓
avatar_url이 null 또는 ""인가?
  ↓ YES
'/default-avatar.png' 사용
  ↓ NO
백엔드에서 받은 URL 사용
```

### 2. 이미지 로드 시
```
<img src={imageUrl} />
  ↓
이미지 로드 성공?
  ↓ YES
이미지 표시
  ↓ NO
onerror 이벤트 발생
  ↓
handleImageError() 실행
  ↓
src를 '/default-avatar.png'로 변경
```

## 📊 이미지 요구사항

### 권장 사양

**캐릭터 아바타**:
- 크기: 200x200px 이상
- 비율: 5:6 (가로:세로)
- 형식: PNG, JPG, WebP

**메생결산 이미지**:
- 크기: 400x300px 이상
- 비율: 4:3
- 형식: PNG, JPG, WebP

**기본 이미지**:
- 크기: 200x200px 이상
- 정사각형 권장
- 형식: PNG (투명 배경 지원)

## 🚀 최적화 팁

### 1. 이미지 최적화
```bash
# ImageMagick으로 크기 조정
convert default-avatar.png -resize 200x200 default-avatar-optimized.png

# WebP로 변환 (더 작은 파일 크기)
cwebp default-avatar.png -o default-avatar.webp
```

### 2. 다양한 크기 제공

고해상도 디스플레이 지원:
```html
<img 
  src="/default-avatar.png"
  srcset="/default-avatar.png 1x, /default-avatar@2x.png 2x"
  alt="..."
/>
```

### 3. Lazy Loading

성능 향상을 위해 지연 로딩 사용:
```html
<img 
  src={imageUrl}
  loading="lazy"
  alt="..."
/>
```

## 🐛 트러블슈팅

### 이미지가 표시되지 않음

1. **파일 경로 확인**
   ```bash
   # 파일이 존재하는지 확인
   ls dpbr_front/app/static/default-avatar.png
   ```

2. **브라우저 확인**
   - F12 → Network 탭
   - `/default-avatar.png` 요청이 404인지 확인

3. **빌드 확인**
   ```bash
   # static 폴더가 빌드에 포함되는지 확인
   npm run build
   ls dpbr_front/app/build/default-avatar.png
   ```

### 이미지가 깨져 보임

1. **이미지 형식 확인**
   - 지원되는 형식: PNG, JPG, JPEG, WebP, GIF, SVG

2. **파일 손상 확인**
   ```bash
   # 이미지 파일이 정상인지 확인
   file dpbr_front/app/static/default-avatar.png
   ```

### CORS 에러

외부 이미지 URL 사용 시:
- 백엔드에서 CORS 헤더 설정 필요
- 또는 프록시를 통해 이미지 제공

## 📚 관련 파일

- `dpbr_front/app/src/lib/api.ts` - API 응답 처리
- `dpbr_front/app/src/lib/utils/image.ts` - 이미지 유틸리티
- `dpbr_front/app/static/default-avatar.png` - 기본 이미지
- 모든 컴포넌트와 페이지 - `onerror={handleImageError}` 적용

---

**Made with ❤️ for 단풍바람 Club**
