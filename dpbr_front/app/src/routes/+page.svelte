<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import CharacterCard from '$lib/components/CharacterCard.svelte';
	import { characters } from '$lib/data';

	let sidebarOpen = $state(false);
</script>

<svelte:head>
	<title>단풍바람 - 메생결산</title>
</svelte:head>

<Sidebar open={sidebarOpen} onClose={() => (sidebarOpen = false)} />

<Header variant="main" onMenuClick={() => (sidebarOpen = true)} />

<!-- Character Grid -->
<div class="flex-1 bg-primary px-4 py-6 overflow-y-auto">
	<div class="grid grid-cols-3 gap-1.5">
		{#each characters as character (character.id)}
			<CharacterCard {character} />
		{/each}
	</div>
</div>
