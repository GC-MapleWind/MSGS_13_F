<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';
	import Toast from '$lib/components/Toast.svelte'; // Toast 컴포넌트 임포트 추가

	let showToast = $state(false);
	let toastMessage = $state('');

	function showToastMessage(message: string) {
		toastMessage = message;
		showToast = true;
	}

	function handleToastClose() {
		showToast = false;
		toastMessage = '';
	}

	// 백엔드로 인가 코드를 전송하는 함수
	async function sendCodeToBackend(code: string) {
		try {
			const response = await fetch('/auth/kakao/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ code })
			});

			if (response.ok) {
				const data = await response.json();
				console.log('백엔드 응답:', data);

				if (response.status === 200) {
					const { token, user } = data;
					authStore.setAuthData(token, user);
					goto('/');
				} else if (response.status === 202) {
					const { registerToken } = data;
					if (registerToken) {
						authStore.setRegisterToken(registerToken);
						goto('/auth/signup');
					} else {
						console.error('202 응답에 registerToken이 없습니다.');
						showToastMessage('회원가입 토큰이 유효하지 않습니다.'); // 메시지 표시
						goto('/login');
					}
				}
			} else {
				const errorData = await response.json();
				console.error('백엔드 로그인 실패:', response.status, errorData);
				showToastMessage(errorData.message || '로그인에 실패했습니다.'); // 메시지 표시
				goto('/login');
			}
		} catch (error) {
			console.error('네트워크 오류:', error);
			showToastMessage('네트워크 오류가 발생했습니다.'); // 메시지 표시
			goto('/login');
		}
	}

	onMount(() => {
		const code = $page.url.searchParams.get('code');
		const error = $page.url.searchParams.get('error');

		if (error) {
			console.error('카카오 로그인 에러:', error);
			showToastMessage('카카오 로그인 중 오류가 발생했습니다.'); // 메시지 표시
			goto('/login');
			return;
		}

		if (code) {
			console.log('카카오 인가 코드:', code);
			sendCodeToBackend(code);
		} else {
			console.warn('인가 코드를 찾을 수 없습니다.');
			showToastMessage('인가 코드를 찾을 수 없습니다.'); // 메시지 표시
			goto('/login');
		}
	});
</script>

<!-- Toast 메시지 -->
<Toast message={toastMessage} show={showToast} onClose={handleToastClose} />

<h1>카카오 로그인 처리 중...</h1>
<p>잠시만 기다려 주세요.</p>