<script lang="ts">
	import InputBox from "$lib/components/InputBox.svelte";
	import Button from "$lib/components/Button.svelte";
	import { goto } from "$app/navigation";
	import { authStore } from "$lib/stores/auth";
	import * as api from "$lib/utils/api";
	import { get } from "svelte/store";
	import Toast from "$lib/components/Toast.svelte"; // Toast 컴포넌트 임포트 추가

	let studentId = $state("");
	let nickname = $state("");
	let isLoading = $state(false);
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

	async function handleSignup() {
		const trimmedStudentId = studentId.trim();
		const trimmedNickname = nickname.trim();

		// 기본 필수 입력 검사
		if (!trimmedStudentId || !trimmedNickname) {
			showToastMessage("학번과 닉네임을 입력해주세요."); // 메시지 표시
			return;
		}

		// 학번 유효성 검사 (9자리 숫자)
		if (trimmedStudentId.length !== 9 || !/^\d+$/.test(trimmedStudentId)) {
			showToastMessage("학번은 9자리 숫자로 입력해주세요."); // 메시지 표시
			return;
		}

		// 닉네임 유효성 검사 (2자 이상 10자 이하, 한글, 영어, 숫자만)
		if (
			trimmedNickname.length < 2 ||
			trimmedNickname.length > 10 ||
			!/^[a-zA-Z0-9가-힣]+$/.test(trimmedNickname)
		) {
			showToastMessage(
				"닉네임은 2자 이상 10자 이하의 한글, 영어, 숫자만 입력 가능합니다.",
			); // 메시지 표시
			return;
		}

		isLoading = true;

		try {
			const { registerToken } = get(authStore);

			if (!registerToken) {
				console.error(
					"registerToken이 없습니다. 로그인 과정을 다시 진행해주세요.",
				);
				showToastMessage(
					"회원가입 토큰이 유효하지 않습니다. 다시 로그인해주세요.",
				); // 메시지 표시
				goto("/login");
				return;
			}

			const response = await api.signup({
				registerToken,
				studentId: trimmedStudentId,
				nickname: trimmedNickname,
			});

			if (response.success && response.data) {
				const { token, user } = response.data;
				authStore.setAuthData(token, user);
				authStore.setRegisterToken(null);
				showToastMessage("회원가입이 성공적으로 완료되었습니다!"); // 성공 메시지 표시
				goto("/");
			} else {
				throw new Error(response.message || "회원가입에 실패했습니다.");
			}
		} catch (error) {
			console.error("회원가입 실패:", error);
			showToastMessage(
				"회원가입에 실패했습니다: " +
					(error instanceof Error ? error.message : String(error)),
			); // 메시지 표시
		} finally {
			isLoading = false;
		}
	}
</script>

<div
	class="min-h-screen bg-bg-app flex flex-col items-center justify-center px-4 py-8"
>
	<!-- Toast 메시지 -->
	<Toast message={toastMessage} show={showToast} onClose={handleToastClose} />

	<div class="w-full max-w-md flex flex-col items-center gap-8">
		<h1 class="text-4xl font-bold text-white">회원가입</h1>

		<div class="w-full flex flex-col gap-4">
			<InputBox
				type="text"
				placeholder="학번 (예: 123456789)"
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
				buttonState={isLoading ? "disabled" : "default"}
			/>
		</div>
	</div>
</div>
