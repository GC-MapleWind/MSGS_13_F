<script lang="ts">
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import { env } from "$env/dynamic/public";
	import InputBox from "$lib/components/InputBox.svelte";
	import Button from "$lib/components/Button.svelte";
	import { toast } from "$lib/stores/toast";
	import { authStore, getSavedName } from "$lib/stores/auth";

	let name = $state("");
	let studentId = $state("");
	let saveName = $state(false);
	let nameFocused = $state(false);
	let studentIdFocused = $state(false);
	let isLoading = $state(false);
	let errorMessage = $state("");
	let studentIdInputRef: HTMLDivElement | undefined = $state();

	// 저장된 이름이 있으면 자동 입력 및 체크박스 활성화
	onMount(() => {
		const savedName = getSavedName();
		if (savedName) {
			// 직접 수정을 대비해 최대 3글자까지만 수용
			name = savedName.slice(0, 3);
			saveName = true;
		}
	});

	// 이름 저장 실시간 처리 ($effect: Svelte 5)
	$effect(() => {
		if (saveName) {
			authStore.saveName(name);
		} else {
			authStore.saveName(null); // 체크 해제 시 삭제
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
			await goto("/");
		} catch (error) {
			// 로그인 실패 처리
			showToastMessage();
			// 학번 필드 초기화 및 포커스
			studentId = "";
			studentIdFocused = true;
			// 다음 틱에 포커스 (DOM 업데이트 후)
			setTimeout(() => {
				const input = studentIdInputRef?.querySelector("input");
				input?.focus();
			}, 0);
		} finally {
			isLoading = false;
		}
	}

	/*
	function handleKakaoLogin() {
		const kakaoClientId = env.PUBLIC_KAKAO_CLIENT_ID;
		const kakaoRedirectUri = env.PUBLIC_KAKAO_REDIRECT_URI;

		if (!kakaoClientId || !kakaoRedirectUri) {
			showToastMessage(
				"카카오 로그인 설정이 누락되었습니다. 관리자에게 문의해주세요.",
			);
			return;
		}

		const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoClientId}&redirect_uri=${kakaoRedirectUri}&response_type=code`;
		window.location.href = KAKAO_AUTH_URL;
	}
	*/

	function showToastMessage(message?: string) {
		errorMessage = message || "이름 또는 학번을 확인해 주세요.";
		setTimeout(() => {
			errorMessage = "";
		}, 3000);
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
		studentId = "";
	}

	function handleNameKeyDown(e: KeyboardEvent) {
		if (e.key === "Enter") {
			e.preventDefault();
			const input = studentIdInputRef?.querySelector("input");
			input?.focus();
		}
	}

	function handleStudentIdKeyDown(e: KeyboardEvent) {
		if (e.key === "Enter" && studentId.length === 9) {
			e.preventDefault();
			handleLogin();
		}
	}
</script>

<svelte:head>
	<title>로그인 - 단풍바람</title>
</svelte:head>

<div class="min-h-screen bg-transparent flex flex-col px-4 py-8">
	<!-- 메인 컨텐츠 -->
	<div class="flex-1 flex items-center justify-center">
		<div class="w-full max-w-md flex flex-col items-center gap-12">
			<!-- 앱 타이틀 이미지 로고 -->
			<img
				src="/images/logos/logo-text-white.svg"
				alt="단풍바람"
				class="h-10 object-contain drop-shadow-sm mb-4"
				draggable="false"
			/>

			<!-- 입력 폼 -->
			<div class="w-full flex flex-col gap-4">
				<!-- 입력 필드 그룹 -->
				<div class="flex flex-col">
					<!-- 이름 입력 -->
					<InputBox
						type="text"
						placeholder="이름"
						value={name}
						maxLength={3}
						inputState={nameFocused ? "focused" : "default"}
						showClearButton={false}
						onInput={(value) => (name = value)}
						onFocus={handleNameFocus}
						onBlur={handleNameBlur}
						onKeyDown={handleNameKeyDown}
						class="rounded-t-lg rounded-b-none bg-white/20 border-b border-white/30 backdrop-blur-sm text-white placeholder-white"
					/>

					<!-- 학번 입력 -->
					<div bind:this={studentIdInputRef}>
						<InputBox
							type="tel"
							placeholder="학번"
							value={studentId}
							maxLength={9}
							inputState={studentIdFocused
								? "focused"
								: "default"}
							showClearButton={true}
							onInput={(value) => (studentId = value)}
							onFocus={handleStudentIdFocus}
							onBlur={handleStudentIdBlur}
							onClear={handleStudentIdClear}
							onKeyDown={handleStudentIdKeyDown}
							class="rounded-b-lg rounded-t-none bg-white/20 backdrop-blur-sm text-white placeholder-white"
						/>
					</div>
				</div>

				<!-- 로그인 버튼 -->
				<div class="relative w-full">
					{#if errorMessage}
						<div
							class="absolute bottom-[calc(100%+8px)] left-0 w-full flex justify-center z-[60] pointer-events-none"
						>
							<span
								class="bg-black/60 text-white text-[15px] px-5 py-2.5 rounded-3xl shadow-md font-medium whitespace-nowrap pointer-events-auto"
							>
								{errorMessage}
							</span>
						</div>
					{/if}
					<Button
						label="메생결산 입장"
						variant="primary"
						buttonState={isLoading ? "disabled" : "default"}
						onClick={handleLogin}
						type="button"
						class="bg-white text-primary-dark hover:bg-white/90 font-medium w-full"
					/>
				</div>

				<!-- 이름 저장 체크박스 -->
				<label class="flex items-center gap-2 cursor-pointer mt-2">
					<input
						type="checkbox"
						bind:checked={saveName}
						class="w-5 h-5 rounded-full border-2 border-white appearance-none checked:bg-white checked:border-white relative
						checked:after:content-['✓'] checked:after:text-primary checked:after:absolute checked:after:inset-0 checked:after:flex checked:after:items-center checked:after:justify-center checked:after:text-sm"
						aria-label="이름 저장"
					/>
					<span class="text-white text-sm">이름 저장</span>
				</label>

				<!-- 카카오 로그인 버튼 주석 처리
				<div class="w-full pt-4 border-t border-white/20 mt-2">
					<Button
						label="카카오 계정으로 로그인"
						variant="secondary"
						onClick={handleKakaoLogin}
						type="button"
						class="bg-[#FEE500] text-black hover:bg-[#FDD835] font-medium border-none"
					/>
				</div>
				-->
			</div>
		</div>
	</div>

	<!-- 푸터 -->
	<div class="mt-8 flex justify-center">
		<p class="text-white/80 text-sm font-light text-center">
			단풍바람 회원이 이용 가능한 서비스입니다.
		</p>
	</div>
</div>
