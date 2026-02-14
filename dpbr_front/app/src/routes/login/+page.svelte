<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import InputBox from '$lib/components/InputBox.svelte';
	import Button from '$lib/components/Button.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import { authStore, getSavedName } from '$lib/stores/auth';
	import { PUBLIC_KAKAO_CLIENT_ID, PUBLIC_KAKAO_REDIRECT_URI } from '$env/static/public';

	let name = $state('');
	let studentId = $state('');
	let saveName = $state(false);
	let nameFocused = $state(false);
	let studentIdFocused = $state(false);
	let showToast = $state(false);
	let isLoading = $state(false);
	let studentIdInputRef: HTMLDivElement | undefined = $state();

	// 저장된 이름이 있으면 자동 입력
	onMount(() => {
		const savedName = getSavedName();
		if (savedName) {
			name = savedName;
		}
	});

	async function handleLogin() {


		// 입력 검증
		if (!name.trim() || !studentId.trim()) {
			showToastMessage();
			return;
		}

		isLoading = true;

		try {
			await authStore.login(name.trim(), studentId.trim(), saveName);
			// 로그인 성공 시 메인 페이지로 이동
			await goto('/');
		} catch (error) {
			// 로그인 실패 처리
			showToastMessage();
			// 학번 필드 초기화 및 포커스
			studentId = '';
			studentIdFocused = true;
			// 다음 틱에 포커스 (DOM 업데이트 후)
			setTimeout(() => {
				const input = studentIdInputRef?.querySelector('input');
				input?.focus();
			}, 0);
		} finally {
			isLoading = false;
		}
	}

	function handleKakaoLogin() {
		const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${PUBLIC_KAKAO_CLIENT_ID}&redirect_uri=${PUBLIC_KAKAO_REDIRECT_URI}&response_type=code`;
		window.location.href = KAKAO_AUTH_URL;
	}

	function showToastMessage() {
		showToast = true;
	}

	function handleToastClose() {
		showToast = false;
	}

	function handleNameFocus() {
		nameFocused = true;
		studentIdFocused = false;
	}

	function handleNameBlur() {
		nameFocused = false;
	}

	function handleStudentIdFocus() {
		studentIdFocused = true;
		nameFocused = false;
	}

	function handleStudentIdBlur() {
		studentIdFocused = false;
	}

	function handleStudentIdClear() {
		studentId = '';
	}
</script>

<svelte:head>
	<title>로그인 - 단풍바람</title>
</svelte:head>

<div class="min-h-screen bg-bg-app flex flex-col items-center justify-center px-4 py-8">
	<!-- Toast 메시지 -->
	<Toast
		message="이름 또는 학번을 확인해 주세요."
		show={showToast}
		onClose={handleToastClose}
	/>

	<!-- 메인 컨텐츠 -->
	<div class="w-full max-w-md flex flex-col items-center gap-8">
		<!-- 앱 타이틀 -->
		<h1 class="text-4xl font-bold text-white">단풍바람</h1>

		<!-- 입력 폼 -->
		<div class="w-full flex flex-col gap-4">
			<!-- 이름 입력 -->
			<InputBox
				type="text"
				placeholder="이름"
				value={name}
				maxLength={3}
				state={nameFocused ? 'focused' : 'default'}
				showClearButton={false}
				onInput={(value) => (name = value)}
				onFocus={handleNameFocus}
				onBlur={handleNameBlur}
			/>

			<!-- 학번 입력 -->
			<div bind:this={studentIdInputRef}>
				<InputBox
					type="tel"
					placeholder="학번"
					value={studentId}
					maxLength={9}
					state={studentIdFocused ? 'focused' : 'default'}
					showClearButton={true}
					onInput={(value) => (studentId = value)}
					onFocus={handleStudentIdFocus}
					onBlur={handleStudentIdBlur}
					onClear={handleStudentIdClear}
				/>
			</div>

			<!-- 로그인 버튼 -->
			<Button
				label="메생결산 입장"
				variant="primary"
				state={isLoading ? 'disabled' : 'default'}
				onClick={handleLogin}
				type="button"
			/>

			<!-- 이름 저장 체크박스 -->
			<label class="flex items-center gap-2 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={saveName}
					class="w-5 h-5 rounded-full border-2 border-primary appearance-none checked:bg-primary checked:border-primary relative
						checked:after:content-['✓'] checked:after:text-white checked:after:absolute checked:after:inset-0 checked:after:flex checked:after:items-center checked:after:justify-center checked:after:text-sm"
					aria-label="이름 저장"
				/>
				<span class="text-text-primary text-sm">이름 저장</span>
			</label>

			<!-- 카카오 로그인 버튼 -->
			<Button
				label="카카오톡으로 로그인"
				variant="secondary"
				onClick={handleKakaoLogin}
				type="button"
				class="bg-yellow-400 text-black hover:bg-yellow-500"
			/>
		</div>
	</div>

	<!-- 푸터 -->
	<div class="fixed bottom-[80px] left-0 right-0 flex justify-center">
		<p class="text-text-primary text-sm">단풍바람 회원이 이용 가능한 서비스입니다.</p>
	</div>
</div>
