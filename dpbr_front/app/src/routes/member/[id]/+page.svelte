<script lang="ts">
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import Header from "$lib/components/Header.svelte";
	import SettlementListItem from "$lib/components/SettlementListItem.svelte";
	import {
		getCharacterById,
		getSettlementsByCharacterId,
		getSettlementsByCharacterIdPaginated,
	} from "$lib/api";
	import { handleImageError } from "$lib/utils/image";
	import type { Character, SettlementItem } from "$lib/types";

	const characterId = $derived($page.params.id ?? "");
	let character = $state<Character | null>(null);
	let settlements = $state<SettlementItem[]>([]);
	let settlementsLoadingMore = $state(false);
	let settlementsHasMore = $state(false);
	let settlementsPage = 1;
	const settlementsLimit = 10;
	let settlementsSentinel = $state<HTMLDivElement | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	$effect(() => {
		// characterId가 변경될 때마다 데이터 로드
		loadData();
	});

	async function loadData() {
		if (!characterId) return;

		loading = true;
		error = null;

		try {
			const charData = await getCharacterById(characterId);
			character = charData;
			if (!charData) {
				settlements = [];
				settlementsHasMore = false;
				return;
			}

			settlements = [];
			settlementsPage = 1;
			settlementsHasMore = true;
			await loadMoreSettlements(characterId);
		} catch (e) {
			console.error("Failed to load character data:", e);
			error = "데이터를 불러오는데 실패했습니다.";
		} finally {
			loading = false;
		}
	}

	async function loadMoreSettlements(targetCharacterId: string) {
		if (settlementsLoadingMore || !settlementsHasMore) return;

		settlementsLoadingMore = true;
		try {
			const result = await getSettlementsByCharacterIdPaginated(
				targetCharacterId,
				settlementsPage,
				settlementsLimit,
			);

			settlements = [...settlements, ...result.items];
			settlementsHasMore = settlements.length < result.total && result.items.length > 0;
			if (result.items.length > 0) {
				settlementsPage += 1;
			}
		} catch (e) {
			if (
				e instanceof Error &&
				e.message.includes("API Error: 404") &&
				settlementsPage === 1
			) {
				const fallbackItems = await getSettlementsByCharacterId(targetCharacterId);
				settlements = fallbackItems;
				settlementsHasMore = false;
				return;
			}

			console.error("Failed to load settlements:", e);
			error = "데이터를 불러오는데 실패했습니다.";
			settlementsHasMore = false;
		} finally {
			settlementsLoadingMore = false;
		}
	}

	$effect(() => {
		if (!settlementsSentinel || !settlementsHasMore) return;

		const currentCharacterId = characterId;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					void loadMoreSettlements(currentCharacterId);
				}
			},
			{ rootMargin: "160px 0px" },
		);

		observer.observe(settlementsSentinel);

		return () => {
			observer.disconnect();
		};
	});
</script>

<svelte:head>
	<title>{character?.name ?? "캐릭터"} - 단풍바람</title>
</svelte:head>

{#if loading}
	<div class="flex-1 flex items-center justify-center">
		<p class="text-text-muted">로딩 중...</p>
	</div>
{:else if error}
	<div class="flex-1 flex items-center justify-center">
		<p class="text-text-muted">{error}</p>
	</div>
{:else if character}
	<div class="flex flex-col h-full bg-bg-light">
		<Header
			variant="detail"
			title="메생결산 상세"
			onBackClick={() => goto("/")}
		/>

		<div class="flex-1 overflow-y-auto flex flex-col gap-2 pb-8">
			<!-- Character Info -->
			<div class="flex items-center gap-4 bg-white px-6 py-5">
				<div
					class="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-bg-light flex items-center justify-center"
				>
					<img
						src={character.avatarUrl}
						alt={character.name}
						onerror={handleImageError}
						class="w-full h-full object-cover"
					/>
				</div>
				<div class="flex flex-col grow min-w-0">
					<div class="flex items-center gap-2">
						<span class="text-base text-text-primary font-medium"
							>{character.name}</span
						>
						<span class="text-base text-text-primary"
							>{character.nickname}</span
						>
					</div>
					<div
						class="flex items-center gap-1 text-xs text-text-muted"
					>
						<span>{"Lv. " + character.level}</span>
						<div class="w-px h-1.5 bg-border-dark"></div>
						<span>{character.server}</span>
						<div class="w-px h-1.5 bg-border-dark"></div>
						<span>{character.job}</span>
					</div>
				</div>
				<a
					href="/member/{characterId}/save"
					class="shrink-0 flex items-center justify-center h-10 px-4 rounded-2xl border border-border-dark text-sm font-light text-text-secondary hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-200 transition-none"
				>
					저장
				</a>
			</div>

			<div class="bg-white flex flex-col pb-2">
				<div
					class="flex items-center px-6 py-5 border-b border-bg-light"
				>
					<span class="text-base font-medium text-text-primary">획득한 메생결산 목록</span>
				</div>
				<div class="flex flex-col">
					{#if settlements.length > 0}
						{#each settlements as item (item.id)}
							<SettlementListItem {item} />
						{/each}
						{#if settlementsHasMore}
							<div bind:this={settlementsSentinel} class="py-4 flex items-center justify-center">
								{#if settlementsLoadingMore}
									<p class="text-text-muted text-sm">불러오는 중...</p>
								{/if}
							</div>
						{/if}
					{:else}
						<div class="flex items-center justify-center py-8">
							<p class="text-text-muted">메생결산이 없습니다.</p>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Footer Logo (Fixed) -->
		<div
			class="flex justify-center items-center h-[calc(100dvh*64/874)] bg-white shrink-0 mt-2"
		>
			<img
				src="/images/logos/logo-text-mono.svg"
				alt="단풍바람"
				class="h-5 opacity-40 object-contain"
				draggable="false"
			/>
		</div>
	</div>
{:else}
	<div class="flex-1 flex items-center justify-center">
		<p class="text-text-muted">캐릭터를 찾을 수 없습니다.</p>
	</div>
{/if}
