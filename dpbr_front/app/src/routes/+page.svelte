<script lang="ts">
	import { onMount } from "svelte";
	import Header from "$lib/components/Header.svelte";
	import Sidebar from "$lib/components/Sidebar.svelte";
	import CharacterCard from "$lib/components/CharacterCard.svelte";
	import { getCharactersPaginated } from "$lib/api";
	import type { Character } from "$lib/types";

	let sidebarOpen = $state(false);
	let characters = $state<Character[]>([]);
	let loading = $state(true);
	let loadingMore = $state(false);
	let hasMore = $state(true);
	let error = $state<string | null>(null);
	let page = 1;
	const limit = 12;
	let sentinel = $state<HTMLDivElement | null>(null);

	async function loadMoreCharacters() {
		if (loadingMore || !hasMore) return;

		loadingMore = true;
		try {
			const result = await getCharactersPaginated(page, limit);
			if (page === 1) {
				characters = result.items;
			} else {
				characters = [...characters, ...result.items];
			}

			hasMore = characters.length < result.total && result.items.length > 0;
			if (result.items.length > 0) {
				page += 1;
			}
		} catch (e) {
			console.error("Failed to load characters:", e);
			error = "캐릭터 목록을 불러오는데 실패했습니다.";
			hasMore = false;
		} finally {
			loading = false;
			loadingMore = false;
		}
	}

	onMount(() => {
		void loadMoreCharacters();
	});

	$effect(() => {
		if (!sentinel || !hasMore || loading) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					void loadMoreCharacters();
				}
			},
			{ rootMargin: "200px 0px" },
		);

		observer.observe(sentinel);

		return () => {
			observer.disconnect();
		};
	});
</script>

<svelte:head>
	<title>단풍바람 - 메생결산</title>
</svelte:head>

<div
	class="flex flex-col h-full bg-[linear-gradient(to_bottom,#FAC486,#F2A372)]"
>
	<Sidebar open={sidebarOpen} onClose={() => (sidebarOpen = false)} />

	<Header variant="main" onMenuClick={() => (sidebarOpen = true)} />

	<!-- Character Grid -->
	<div class="flex-1 px-4 py-6 overflow-y-auto min-h-0">
		{#if loading}
			<div class="flex items-center justify-center h-full">
				<p class="text-white">로딩 중...</p>
			</div>
		{:else if error}
			<div class="flex items-center justify-center h-full">
				<p class="text-white">{error}</p>
			</div>
		{:else}
			<div class="grid grid-cols-3 gap-1.5">
				{#each characters as character (character.id)}
					<CharacterCard {character} />
				{/each}
			</div>
			{#if hasMore}
				<div bind:this={sentinel} class="h-10 flex items-center justify-center">
					{#if loadingMore}
						<p class="text-white text-sm">불러오는 중...</p>
					{/if}
				</div>
			{/if}
		{/if}
	</div>
</div>
