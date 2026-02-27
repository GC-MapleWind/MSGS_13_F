<script lang="ts">
	import "../app.css";
	import { onMount } from "svelte";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import type { Snippet } from "svelte";
	import Toast from "$lib/components/Toast.svelte";
	import {
		CLIENT_ERROR_TOAST_EVENT,
		type ClientErrorToastDetail,
	} from "$lib/events/client-error";
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

	function normalizePath(pathname: string): string {
		if (pathname.length > 1 && pathname.endsWith("/")) {
			return pathname.slice(0, -1);
		}

		return pathname;
	}

	const currentPath = $derived(normalizePath($page.url.pathname));
	const isLoginRoute = $derived(currentPath.startsWith("/login"));
	const isSignupRoute = $derived(currentPath.startsWith("/auth/signup"));
	let hasCheckedAuth = $state(false);
	let navigationInFlight = false;
	let showGlobalErrorToast = $state(false);
	let globalErrorToastMessage = $state("");

	function handleGlobalErrorToastClose() {
		showGlobalErrorToast = false;
	}

	function navigateTo(path: string) {
		const target = normalizePath(path);

		if (navigationInFlight || currentPath === target) {
			return;
		}

		navigationInFlight = true;
		queueMicrotask(async () => {
			try {
				await goto(path);
			} finally {
				navigationInFlight = false;
			}
		});
	}

	onMount(() => {
		const unsubscribe = authStore.subscribe((state) => {
			authState = state;
		});
		const onClientErrorToast = (event: Event) => {
			const customEvent = event as CustomEvent<ClientErrorToastDetail>;
			globalErrorToastMessage = customEvent.detail?.message ?? "오류가 발생했습니다.";
			showGlobalErrorToast = true;
		};

		window.addEventListener(CLIENT_ERROR_TOAST_EVENT, onClientErrorToast);

		void authStore.checkAuth().finally(() => {
			hasCheckedAuth = true;
		});

		return () => {
			window.removeEventListener(CLIENT_ERROR_TOAST_EVENT, onClientErrorToast);
			unsubscribe();
		};
	});

	$effect(() => {
		if (!hasCheckedAuth || authState.isLoading) {
			return;
		}

		if (authState.isAuthenticated) {
			if (isLoginRoute || isSignupRoute) {
				navigateTo("/");
			}
			return;
		}

		if (isLoginRoute && authState.registerToken) {
			navigateTo("/auth/signup");
		}
	});
</script>

<div
	class="h-screen bg-bg-app flex justify-center items-center overflow-hidden"
>
	<div
		class="bg-white shadow-lg relative flex flex-col h-full w-full max-w-3xl overflow-hidden"
	>
		{@render children()}
	</div>
</div>

<Toast
	message={globalErrorToastMessage}
	show={showGlobalErrorToast}
	onClose={handleGlobalErrorToastClose}
/>
