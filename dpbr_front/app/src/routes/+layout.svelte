<script lang="ts">
	import "../app.css";
	import { onMount } from "svelte";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import type { Snippet } from "svelte";
	import { authStore } from "$lib/stores/auth";
	import type { AuthState } from "$lib/types";

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	let authState: AuthState = $state({
		isAuthenticated: false,
		user: null,
		isLoading: true,
		registerToken: null,
	});
	authStore.subscribe((state) => {
		authState = state;
	});

	const currentPath = $derived($page.url.pathname);
	const isLoginPage = $derived(currentPath === "/login");
	let hasCheckedAuth = $state(false);

	onMount(async () => {
		// 인증 상태 확인
		await authStore.checkAuth();
		hasCheckedAuth = true;
	});

	// 경로 변경 시 인증 체크 (로그인 페이지 제외)
	$effect(() => {
		if (
			hasCheckedAuth &&
			!isLoginPage &&
			!authState.isAuthenticated &&
			!authState.isLoading
		) {
			goto("/login");
		}
	});
</script>

<div
	class="h-screen bg-bg-app flex justify-center items-center overflow-hidden"
>
	<div
		class="bg-white shadow-lg relative flex flex-col h-[calc(100vh-40px)] aspect-[768/874] max-w-[768px] min-w-[320px] overflow-hidden"
	>
		<div class="flex-1 overflow-y-auto">
			{@render children()}
		</div>
	</div>
</div>
