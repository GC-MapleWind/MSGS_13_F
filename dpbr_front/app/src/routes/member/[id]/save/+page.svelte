<script lang="ts">
	import { page } from '$app/stores';
	import { Download } from 'lucide-svelte';
	import Header from '$lib/components/Header.svelte';
	import { getCharacterById } from '$lib/data';

	const characterId = $derived($page.params.id ?? '');
	const character = $derived(getCharacterById(characterId));

	let cardElement: HTMLDivElement | undefined = $state();

	function goBack() {
		history.back();
	}

	async function saveImage() {
		if (!cardElement) return;
		try {
			const { toPng } = await import('html-to-image');
			const dataUrl = await toPng(cardElement, { cacheBust: true });
			const link = document.createElement('a');
			link.download = `${character?.nickname ?? 'card'}.png`;
			link.href = dataUrl;
			link.click();
		} catch (err) {
			console.error('이미지 저장 실패:', err);
		}
	}
</script>

<svelte:head>
	<title>카드 저장 - {character?.name ?? ''}</title>
</svelte:head>

<div class="absolute inset-0 bg-bg-overlay z-50 flex flex-col">
	<!-- Header -->
	<Header variant="save" onCloseClick={goBack} />

	<!-- Card Preview -->
	<div class="flex-1 flex flex-col items-center justify-center px-8 gap-4">
		{#if character}
			<div
				bind:this={cardElement}
				class="w-full max-w-64 aspect-[9/16] bg-gradient-to-br from-primary to-secondary rounded-2xl flex flex-col items-center justify-center gap-4 p-6 shadow-2xl"
			>
				<div class="w-32 h-32 rounded-full overflow-hidden bg-white/30">
					<img
						src={character.avatarUrl}
						alt={character.name}
						class="w-full h-full object-cover"
					/>
				</div>
				<div class="text-center">
					<p class="text-xl font-bold text-white">{character.nickname}</p>
					<p class="text-sm text-white/80 mt-1">{character.name}</p>
				</div>
				<div class="flex flex-col items-center gap-1 text-white/70 text-xs">
					<span>Lv. {character.level}</span>
					<span>{character.server} · {character.job}</span>
					<span>{character.club}</span>
				</div>
				<div class="mt-2 px-4 py-1.5 bg-white/20 rounded-full">
					<span class="text-xs text-white">단풍바람 13기</span>
				</div>
			</div>

			<span class="text-xs text-text-muted">내 캐릭터 카드를 저장해 보세요!</span>
		{/if}
	</div>

	<!-- Save Button -->
	<div class="flex justify-center pb-8">
		<button
			onclick={saveImage}
			class="flex items-center gap-2 px-6 py-3 rounded-full border border-white/30 text-white hover:bg-white/10 transition-colors"
		>
			<Download size={16} />
			<span class="text-base">저장하기</span>
		</button>
	</div>
</div>
