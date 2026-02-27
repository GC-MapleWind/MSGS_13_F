<script lang="ts">
	import InputBox from "$lib/components/InputBox.svelte";
	import Button from "$lib/components/Button.svelte";
	import Toast from "$lib/components/Toast.svelte";
	import { goto } from "$app/navigation";
	import { authStore } from "$lib/stores/auth";
	import * as api from "$lib/utils/api";
	import { get } from "svelte/store";

	type FormField =
		| "name"
		| "studentId"
		| "nickname"
		| "password"
		| "passwordConfirm";
	type FormErrors = Partial<Record<FormField, string>>;

	let name = $state("");
	let studentId = $state("");
	let nickname = $state("");
	let password = $state("");
	let passwordConfirm = $state("");
	let isLoading = $state(false);
	let errors = $state<FormErrors>({});
	let showToast = $state(false);
	let toastMessage = $state("");

	function showToastMessage(message: string) {
		toastMessage = message;
		showToast = true;
	}

	function handleToastClose() {
		showToast = false;
		toastMessage = "";
	}

	function clearError(field: FormField) {
		if (!errors[field]) return;
		const nextErrors = { ...errors };
		delete nextErrors[field];
		errors = nextErrors;
	}

	function validateForm(): boolean {
		const trimmedName = name.trim();
		const trimmedStudentId = studentId.trim();
		const trimmedNickname = nickname.trim();
		const nextErrors: FormErrors = {};

		if (!trimmedName) {
			nextErrors.name = "이름을 입력해주세요.";
		} else if (trimmedName.length < 2 || trimmedName.length > 20) {
			nextErrors.name = "이름은 2자 이상 20자 이하로 입력해주세요.";
		}

		if (!trimmedStudentId) {
			nextErrors.studentId = "학번을 입력해주세요.";
		} else if (!/^\d{9}$/.test(trimmedStudentId)) {
			nextErrors.studentId = "학번은 9자리 숫자로 입력해주세요.";
		}

		if (!trimmedNickname) {
			nextErrors.nickname = "닉네임을 입력해주세요.";
		} else if (
			trimmedNickname.length < 2 ||
			trimmedNickname.length > 10 ||
			!/^[a-zA-Z0-9가-힣]+$/.test(trimmedNickname)
		) {
			nextErrors.nickname =
				"닉네임은 2자 이상 10자 이하의 한글, 영어, 숫자만 가능합니다.";
		}

		if (!password) {
			nextErrors.password = "비밀번호를 입력해주세요.";
		} else if (
			password.length < 8 ||
			!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/.test(password)
		) {
			nextErrors.password = "비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다.";
		}

		if (!passwordConfirm) {
			nextErrors.passwordConfirm = "비밀번호 확인을 입력해주세요.";
		} else if (password !== passwordConfirm) {
			nextErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
		}

		errors = nextErrors;
		return Object.keys(nextErrors).length === 0;
	}

	async function handleSignup() {
		if (!validateForm()) {
			showToastMessage("입력값을 확인해주세요.");
			return;
		}

		isLoading = true;

		try {
			const { registerToken } = get(authStore);
			const response = await api.signup({
				registerToken: registerToken || undefined,
				name: name.trim(),
				studentId: studentId.trim(),
				nickname: nickname.trim(),
				password: password.trim(),
			});

			if (!response.success) {
				throw new Error(response.message || "회원가입에 실패했습니다.");
			}

			const token = response.data?.token;
			const user = response.data?.user;
			authStore.setRegisterToken(null);

			if (token && user) {
				authStore.setAuthData(token, user);
				showToastMessage("회원가입이 완료되었습니다.");
				await goto("/");
				return;
			}

			showToastMessage("회원가입이 완료되었습니다. 로그인 후 이용해주세요.");
			await goto("/login");
		} catch (error) {
			showToastMessage(
				`회원가입에 실패했습니다: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>회원가입 - 단풍바람</title>
</svelte:head>

<div
	class="min-h-screen bg-gradient-to-b from-[#FCDDA5] to-[#F1A470] flex flex-col items-center justify-center px-4 py-8"
>
	<Toast message={toastMessage} show={showToast} onClose={handleToastClose} />

	<div class="w-full max-w-md flex flex-col items-center gap-8">
		<h1 class="text-4xl font-bold text-white tracking-widest drop-shadow-sm">
			회원가입
		</h1>

		<div class="w-full flex flex-col gap-3">
			<div class="flex flex-col gap-1">
				<InputBox
					type="text"
					placeholder="이름"
					value={name}
					maxLength={20}
					onInput={(value) => {
						name = value;
						clearError("name");
					}}
					class="bg-white/20 backdrop-blur-sm text-white placeholder-white"
				/>
				{#if errors.name}
					<p class="text-red-100 text-sm px-1">{errors.name}</p>
				{/if}
			</div>

			<div class="flex flex-col gap-1">
				<InputBox
					type="tel"
					placeholder="학번 (9자리)"
					value={studentId}
					maxLength={9}
					onInput={(value) => {
						studentId = value.replace(/\D/g, "");
						clearError("studentId");
					}}
					class="bg-white/20 backdrop-blur-sm text-white placeholder-white"
				/>
				{#if errors.studentId}
					<p class="text-red-100 text-sm px-1">{errors.studentId}</p>
				{/if}
			</div>

			<div class="flex flex-col gap-1">
				<InputBox
					type="text"
					placeholder="닉네임"
					value={nickname}
					maxLength={10}
					onInput={(value) => {
						nickname = value;
						clearError("nickname");
					}}
					class="bg-white/20 backdrop-blur-sm text-white placeholder-white"
				/>
				{#if errors.nickname}
					<p class="text-red-100 text-sm px-1">{errors.nickname}</p>
				{/if}
			</div>

			<div class="flex flex-col gap-1">
				<InputBox
					type="password"
					placeholder="비밀번호"
					value={password}
					maxLength={64}
					onInput={(value) => {
						password = value;
						clearError("password");
						if (passwordConfirm) clearError("passwordConfirm");
					}}
					class="bg-white/20 backdrop-blur-sm text-white placeholder-white"
				/>
				{#if errors.password}
					<p class="text-red-100 text-sm px-1">{errors.password}</p>
				{/if}
			</div>

			<div class="flex flex-col gap-1">
				<InputBox
					type="password"
					placeholder="비밀번호 확인"
					value={passwordConfirm}
					maxLength={64}
					onInput={(value) => {
						passwordConfirm = value;
						clearError("passwordConfirm");
					}}
					class="bg-white/20 backdrop-blur-sm text-white placeholder-white"
				/>
				{#if errors.passwordConfirm}
					<p class="text-red-100 text-sm px-1">{errors.passwordConfirm}</p>
				{/if}
			</div>

			<Button
				label={isLoading ? "가입 중..." : "가입 완료"}
				variant="primary"
				onClick={handleSignup}
				type="button"
				buttonState={isLoading ? "disabled" : "default"}
				class="bg-white text-primary-dark hover:bg-white/90 font-medium mt-2"
			/>

			<button
				type="button"
				class="text-sm text-white/90 underline underline-offset-2 mt-2"
				onclick={() => goto("/login")}
			>
				이미 계정이 있나요? 로그인
			</button>
		</div>
	</div>
</div>
