<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	// TODO: Toast 컴포넌트 임포트 (Phase 5)
	import { authStore } from '$lib/stores/auth'; // authStore 임포트 추가

	// 백엔드로 인가 코드를 전송하는 함수
	async function sendCodeToBackend(code: string) {
		try {
			const response = await fetch('/auth/kakao/login', { // 백엔드 API 엔드포인트
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ code })
			});

			if (response.ok) { // 200 OK or 202 Accepted
				const data = await response.json();
				console.log('백엔드 응답:', data);

				if (response.status === 200) {
					// 기존 유저: 로그인 성공, 메인 페이지로 이동
					const { token, user } = data;
					authStore.setAuthData(token, user); // authStore에 토큰 및 유저 정보 저장
					goto('/');
				} else if (response.status === 202) {
					// 신규 유저: 회원가입 페이지로 이동
					const { registerToken } = data;
					if (registerToken) {
						authStore.setRegisterToken(registerToken); // registerToken 저장
						goto('/auth/signup');
					} else {
						console.error('202 응답에 registerToken이 없습니다.');
						// TODO: 사용자에게 에러 메시지 표시 (Phase 5)
						goto('/login');
					}
				}
			} else {
				// 백엔드 에러 처리
				const errorData = await response.json();
				console.error('백엔드 로그인 실패:', response.status, errorData);
				// TODO: 사용자에게 에러 메시지 표시 (Phase 5)
				goto('/login'); // 로그인 페이지로 리다이렉트
			}
		} catch (error) {
			console.error('네트워크 오류:', error);
			// TODO: 사용자에게 네트워크 에러 메시지 표시 (Phase 5)
			goto('/login'); // 로그인 페이지로 리다이렉트
		}
	}

	onMount(() => {
		const code = $page.url.searchParams.get('code');
		const error = $page.url.searchParams.get('error');

		if (error) {
			console.error('카카오 로그인 에러:', error);
			// TODO: 에러 처리 및 사용자에게 알림 (Phase 5)
			goto('/login');
			return;
		}

		if (code) {
			console.log('카카오 인가 코드:', code);
			sendCodeToBackend(code); // 백엔드로 코드 전송
		} else {
			console.warn('인가 코드를 찾을 수 없습니다.');
			goto('/login');
		}
	});
</script>

<h1>카카오 로그인 처리 중...</h1>
<p>잠시만 기다려 주세요.</p>