<script lang="ts">
	import { onMount } from "svelte";
	import Header from "$lib/components/Header.svelte";
	import Sidebar from "$lib/components/Sidebar.svelte";
	import CharacterCard from "$lib/components/CharacterCard.svelte";
	import { getCharacters } from "$lib/api";
	import type { Character } from "$lib/types";

	let sidebarOpen = $state(false);
	let characters = $state<Character[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			characters = await getCharacters();
		} catch (e) {
			console.error("Failed to load characters:", e);
			error = "캐릭터 목록을 불러오는데 실패했습니다.";
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>단풍바람 - 메생결산</title>
</svelte:head>

<div class="flex flex-col h-full bg-gradient-to-b from-[#FCDDA5] to-[#F1A470]">
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
		{/if}
	</div>
</div>
