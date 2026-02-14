<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation'; // 나중에 사용할 수 있도록 미리 임포트

	onMount(() => {
		const code = $page.url.searchParams.get('code');
		const error = $page.url.searchParams.get('error');

		if (error) {
			console.error('카카오 로그인 에러:', error);
			// TODO: 에러 처리 및 사용자에게 알림
			goto('/login'); // 에러 발생 시 로그인 페이지로 리다이렉트
			return;
		}

		if (code) {
			console.log('카카오 인가 코드:', code);
			// TODO: 백엔드로 코드 전송 로직 구현
		} else {
			console.warn('인가 코드를 찾을 수 없습니다.');
			goto('/login'); // 코드가 없으면 로그인 페이지로 리다이렉트
		}
	});
</script>

<h1>카카오 로그인 처리 중...</h1>
<p>잠시만 기다려 주세요.</p>