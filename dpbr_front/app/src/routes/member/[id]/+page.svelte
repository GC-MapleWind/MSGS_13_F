<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	import SettlementListItem from '$lib/components/SettlementListItem.svelte';
	import { getCharacterById, getSettlementsByCharacterId } from '$lib/data';
	import { captureElementAsImage, generateFilename } from '$lib/utils/capture';

	const characterId = $derived($page.params.id ?? '');
	const character = $derived(getCharacterById(characterId));
	const settlements = $derived(getSettlementsByCharacterId(characterId));

	let captureArea: HTMLElement | undefined;
	let isCapturing = $state(false);

	async function handleCapture() {
		if (!captureArea || !character || isCapturing) return;

		try {
			isCapturing = true;
			const filename = generateFilename(`character-${character.name}`);
			await captureElementAsImage(captureArea, filename);
		} catch (error) {
			console.error('페이지 캡쳐 실패:', error);
			alert('페이지 저장에 실패했습니다. 다시 시도해주세요.');
		} finally {
			isCapturing = false;
		}
	}
</script>

<svelte:head>
	<title>{character?.name ?? '캐릭터'} - 단풍바람</title>
</svelte:head>

{#if character}
	<Header
		variant="detail"
		onBackClick={() => goto('/')}
		onSaveClick={handleCapture}
		isSaving={isCapturing}
	/>

	<!-- Capture Area -->
	<div bind:this={captureArea}>
		<!-- Character Info -->
		<div class="flex items-center gap-4 bg-white px-6 py-4 border-b border-border">
		<div class="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-bg-light">
			<img src={character.avatarUrl} alt={character.name} class="w-full h-full object-cover" />
		</div>
		<div class="flex flex-col grow min-w-0">
			<div class="flex items-center gap-2">
				<span class="text-base text-text-primary font-medium">{character.name}</span>
				<span class="text-base text-text-primary">{character.nickname}</span>
			</div>
			<div class="flex items-center gap-1 text-xs text-text-muted">
				<span>Lv. {character.level}</span>
				<div class="w-px h-1.5 bg-border-dark"></div>
				<span>{character.server}</span>
				<div class="w-px h-1.5 bg-border-dark"></div>
				<span>{character.job}</span>
			</div>
		</div>
		<a
			href="/member/{characterId}/save"
			class="shrink-0 flex items-center justify-center h-10 px-4 rounded-2xl border border-border-dark text-sm font-light text-text-secondary"
		>
			저장
		</a>
		</div>

		<!-- Settlement List -->
		<div class="flex-1 bg-bg-light overflow-y-auto">
		<div class="flex items-center bg-white px-6 py-4">
			<span class="text-base font-medium text-text-primary">획득한 메생결산 목록</span>
		</div>
		<div class="flex flex-col bg-white">
			{#each settlements as item (item.id)}
				<SettlementListItem {item} />
			{/each}
		</div>
		</div>
	</div>
{:else}
	<div class="flex-1 flex items-center justify-center">
		<p class="text-text-muted">캐릭터를 찾을 수 없습니다.</p>
	</div>
{/if}
