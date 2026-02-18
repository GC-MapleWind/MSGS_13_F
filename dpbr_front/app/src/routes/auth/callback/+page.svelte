<script lang="ts">
	import { onMount } from "svelte";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import { authStore } from "$lib/stores/auth";
	import * as api from "$lib/utils/api";
	import Toast from "$lib/components/Toast.svelte"; // Toast 컴포넌트 임포트 추가

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

	// 백엔드로 인가 코드를 전송하는 함수
	async function sendCodeToBackend(code: string) {
		try {
			const response = await api.kakaoLogin(code);

			if (response.success && response.data) {
				// 202 Accepted (회원가입 필요) 처리
				if ("registerToken" in response.data) {
					const { registerToken } = response.data;
					authStore.setRegisterToken(registerToken);
					goto("/auth/signup");
					return;
				}

				// 로그인 성공 처리
				if ("token" in response.data) {
					const { token, user } = response.data;
					authStore.setAuthData(token, user);
					goto("/");
					return;
				}
			}

			showToastMessage(response.message || "로그인에 실패했습니다.");
			goto("/login");
		} catch (error) {
			showToastMessage("네트워크 오류가 발생했습니다.");
			goto("/login");
		}
	}

	onMount(() => {
		const code = $page.url.searchParams.get("code");
		const error = $page.url.searchParams.get("error");

		if (error) {
			showToastMessage("카카오 로그인 중 오류가 발생했습니다."); // 메시지 표시
			goto("/login");
			return;
		}

		if (code) {
			sendCodeToBackend(code);
		} else {
			showToastMessage("인가 코드를 찾을 수 없습니다."); // 메시지 표시
			goto("/login");
		}
	});
</script>

<!-- Toast 메시지 -->
<Toast message={toastMessage} show={showToast} onClose={handleToastClose} />

<h1>카카오 로그인 처리 중...</h1>
<p>잠시만 기다려 주세요.</p>
