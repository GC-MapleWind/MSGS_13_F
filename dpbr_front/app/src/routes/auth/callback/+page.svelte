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
			console.log("백엔드 응답:", response);

			if (response.success && response.data) {
				const { token, user } = response.data;
				authStore.setAuthData(token, user);
				goto("/");
			} else {
				// 202 Accepted (회원가입 필요) 처리
				// api.ts의 공통 로직에서는 success가 false로 올 수 있으므로 여기서 추가 처리가 필요할 수도 있음.
				// 하지만 현재 api.ts 구조상 202도 에러로 처리될 가능성이 있음.
				// api.ts를 수정하여 202 상태코드를 success로 처리하거나, 여기서 에러 메시지를 분석해야 함.
				// 일단 기존 로직을 최대한 보존하며 api.ts의 응답 구조에 맞 춤.

				// 만약 api.ts가 202를 에러로 처리한다면, message에 힌트가 있을 수 있음.
				// 하지만 더 정확한 방법은 api.ts의 kakaoLogin이 원본 response를 다루거나,
				// 202에 대한 별도 처리를 api.ts에 추가하는 것임.
				// 현재는 api.ts가 200만 success로 처리하므로,
				// 백엔드가 202를 줄 때 api.ts가 어떻게 반응할지 확인 필요.
				// **중요**: api.ts의 apiRequest 함수는 response.ok (200-299)를 체크함.
				// 따라서 202도 response.ok는 true임.
				// 하지만 data.success를 true로 반환할 것임.
				// 문제는 202일 때 data 구조가 { registerToken } 일 텐데,
				// LoginResponse 타입은 { token, user } 임.

				// *해결책*: api.ts의 타입을 수정해야 하지만, 일단 any로 우회하여 처리.

				// 백엔드 명세상 202일 때 registerToken을 준다면:
				if (response.success && (response.data as any).registerToken) {
					const registerToken = (response.data as any).registerToken;
					authStore.setRegisterToken(registerToken);
					goto("/auth/signup");
					return;
				}

				console.error("로그인 실패:", response.message);
				showToastMessage(response.message || "로그인에 실패했습니다.");
				goto("/login");
			}
		} catch (error) {
			console.error("네트워크 오류:", error);
			showToastMessage("네트워크 오류가 발생했습니다.");
			goto("/login");
		}
	}

	onMount(() => {
		const code = $page.url.searchParams.get("code");
		const error = $page.url.searchParams.get("error");

		if (error) {
			console.error("카카오 로그인 에러:", error);
			showToastMessage("카카오 로그인 중 오류가 발생했습니다."); // 메시지 표시
			goto("/login");
			return;
		}

		if (code) {
			console.log("카카오 인가 코드:", code);
			sendCodeToBackend(code);
		} else {
			console.warn("인가 코드를 찾을 수 없습니다.");
			showToastMessage("인가 코드를 찾을 수 없습니다."); // 메시지 표시
			goto("/login");
		}
	});
</script>

<!-- Toast 메시지 -->
<Toast message={toastMessage} show={showToast} onClose={handleToastClose} />

<h1>카카오 로그인 처리 중...</h1>
<p>잠시만 기다려 주세요.</p>
