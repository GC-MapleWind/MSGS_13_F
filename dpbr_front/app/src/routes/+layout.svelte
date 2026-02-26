<script lang="ts">
	import "../app.css";
	import { onMount } from "svelte";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import type { Snippet } from "svelte";
	import Toast from "$lib/components/Toast.svelte";
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

		void authStore.checkAuth().finally(() => {
			hasCheckedAuth = true;
		});

		return unsubscribe;
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

		if (isSignupRoute && !authState.registerToken) {
			navigateTo("/login");
			return;
		}

		if (isLoginRoute && authState.registerToken) {
			navigateTo("/auth/signup");
		}
	});
</script>

<div
	class="h-[100dvh] w-full bg-[#FFFBF5] flex justify-center items-center overflow-hidden"
>
	<div
		class="bg-[#FAFAFA] shadow-2xl relative flex flex-col h-full mx-auto overflow-hidden
		w-full min-w-[calc(100dvh*320/874)] max-w-[calc(100dvh*768/874)]
		md:min-w-[calc(100dvh*9/16)] md:max-w-[calc(100dvh*9/16)] md:w-[calc(100dvh*9/16)]"
	>
		<Toast />
		{@render children()}
	</div>
</div>
