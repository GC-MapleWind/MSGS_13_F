# 단바 신청폼 QA 체크리스트 (사용자 플로우)

## 사전 준비
- 프론트 `.env`에 `PUBLIC_API_URL`, `PUBLIC_API_PREFIX`, `PUBLIC_APPLICATION_CURRENT_TERM` 설정
- 백엔드 `.env`에 `APPLICATION_CURRENT_TERM`, `APPLICATION_ALLOW_EDIT_AFTER_SUBMIT` 설정
- 카카오 로그인 가능한 테스트 계정 준비

## 시나리오
1. 로그인 후 `/apply` 진입 가능 확인
2. `/apply/new` 신입 신청 정상 제출
3. `/apply/renew` 재등록 신청 정상 제출
4. 학번 9자리 미만/초과 입력 시 에러 문구 확인
5. 전화번호 형식 오류 시 에러 문구 확인
6. 회칙 동의 미체크 시 제출 차단 확인
7. 신입: 학생증/개인정보 동의 미체크 시 제출 차단 확인
8. 재등록: 회비 안내 확인 미체크 시 제출 차단 확인
9. 제출 후 `/my/application`에서 신청 정보 확인
10. `APPLICATION_ALLOW_EDIT_AFTER_SUBMIT=false`일 때 재제출 차단 확인
11. `APPLICATION_CURRENT_TERM` 불일치 시 제출 차단 확인

## 완료 기준
- 치명 에러 0건
- 제출/조회 경로 모두 정상 동작
- 정책 변수 반영 결과 일치
