<script lang="ts">
	import InputBox from '$lib/components/InputBox.svelte';
	import Button from '$lib/components/Button.svelte';
	import { goto } from '$app/navigation'; // 가입 완료 후 페이지 이동용

	let studentId = $state('');
	let nickname = $state('');
	let isLoading = $state(false); // 제출 중 로딩 상태

	async function handleSignup() {
		// TODO: 프론트엔드 유효성 검사 (Phase 4.2)
		if (!studentId.trim() || !nickname.trim()) {
			alert('학번과 닉네임을 입력해주세요.'); // 임시 알림
			return;
		}

		isLoading = true;

		// TODO: 회원가입 요청 로직 (Phase 4.3)
		try {
			// 여기서는 registerToken을 사용해야 하지만, 현재 authStore에 저장 로직이 없으므로 일단 스킵
			console.log('회원가입 요청:', { studentId, nickname });
			// 임시적으로 메인 페이지로 이동
			await goto('/');
		} catch (error) {
			console.error('회원가입 실패:', error);
			alert('회원가입에 실패했습니다.'); // 임시 알림
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="min-h-screen bg-bg-app flex flex-col items-center justify-center px-4 py-8">
	<div class="w-full max-w-md flex flex-col items-center gap-8">
		<h1 class="text-4xl font-bold text-white">회원가입</h1>

		<div class="w-full flex flex-col gap-4">
			<InputBox
				type="text"
				placeholder="학번 (예: 202235363)"
				value={studentId}
				onInput={(value) => (studentId = value)}
				maxLength={9}
			/>
			<InputBox
				type="text"
				placeholder="닉네임"
				value={nickname}
				onInput={(value) => (nickname = value)}
				maxLength={10}
			/>
			<Button
				label="가입 완료"
				variant="primary"
				onClick={handleSignup}
				type="button"
				state={isLoading ? 'disabled' : 'default'}
			/>
		</div>
	</div>
</div>