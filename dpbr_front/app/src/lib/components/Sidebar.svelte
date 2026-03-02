<script lang="ts">
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";
	import { goto } from "$app/navigation";
	import { authStore } from "$lib/stores/auth";
	import { getAdminCharacter } from "$lib/api";
	import type { AuthState } from "$lib/types";
	import { toast } from "$lib/stores/toast";

	interface Props {
		open: boolean;
		onClose: () => void;
	}

	let { open, onClose }: Props = $props();

	let authState = $state<AuthState>({
		isAuthenticated: false,
		user: null,
		isLoading: false,
	});
	let adminTeamId = $state<string | null>(null);
	const sidebarPeriodText = "메생결산 기록";
	const SIDEBAR_RECORD_PERIOD = "'25년 8월 25일 ~ '26년 2월 22일의 기록";

	onMount(() => {
		const unsubscribeAuth = authStore.subscribe((state) => {
			authState = state;
		});

		const loadAdminCharacter = async () => {
			try {
				const result = await getAdminCharacter();
				adminTeamId = result.id !== null ? result.id.toString() : null;
			} catch (error) {
				console.error("Failed to load admin character:", error);
				adminTeamId = null;
			}
		};

		void loadAdminCharacter();

		return () => {
			unsubscribeAuth();
		};
	});

	async function handleLogout() {
		await authStore.logout();
		toast.show("로그아웃 되었습니다.");
		onClose();
	}
</script>

<!-- Sidebar Panel: 항상 렌더링하고 transform 으로만 위치를 바꿈 -->
<aside
	class={`absolute top-0 left-0 h-full w-3/4 max-w-72 bg-white z-50 flex flex-col justify-between transform transition-transform duration-200 ${
		open ? "translate-x-0" : "-translate-x-full"
	}`}
	aria-hidden={!open}
>
	<div class="flex flex-col gap-3 pt-16">
		<!-- Top Info Group -->
		<div class="flex flex-col gap-0">
			<!-- Title Section -->
			<div class="flex flex-col gap-1 px-6 py-4">
				<span class="text-xs text-text-muted"
					>단풍바람 메생결산 정보</span
				>
				<span class="text-xl font-medium text-primary-dark"
					>단풍바람 13기 메생결산</span
				>
			</div>

			<!-- User Info Section -->
			{#if authState.user}
				<div class="flex items-center justify-between px-6 py-3">
					<span class="text-lg font-medium text-text-primary"
						>{authState.user.name}</span
					>
					<button
						onclick={handleLogout}
						class="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-light rounded transition-colors"
						aria-label="로그아웃"
					>
						로그아웃
					</button>
				</div>
			{/if}
		</div>

		<!-- Menu -->
		<div class="flex flex-col gap-2">
			<div
				class="flex items-center px-6 py-2 bg-bg-light border-t border-border-dark"
			>
				<span class="text-xs text-text-secondary">메생결산핸즈+</span>
			</div>
			<nav class="flex flex-col">
				<a
					href="/"
					class="flex items-center px-6 py-3 text-base text-text-primary hover:bg-bg-light transition-colors"
					onclick={onClose}
				>
					메생결산 소식
				</a>
				<a
					href="/member/{adminTeamId || 'admin-team'}"
					class="flex items-center px-6 py-3 text-base text-text-primary hover:bg-bg-light transition-colors"
					onclick={onClose}
				>
					운영팀 한마디
				</a>
			</nav>
		</div>
	</div>

	<!-- Footer -->
	<div class="flex items-center gap-2 bg-bg-light p-6">
		<span class="text-xs font-medium text-text-secondary"
			>{SIDEBAR_RECORD_PERIOD}</span
		>
	</div>
</aside>

{#if open}
	<!-- Overlay -->
	<button
		class="absolute inset-0 bg-black/50 z-40"
		transition:fade={{ duration: 200 }}
		onclick={onClose}
		aria-label="사이드바 닫기"
	></button>
{/if}
