<script lang="ts">
	import { page } from "$app/stores";
	import { Download } from "lucide-svelte";
	import Header from "$lib/components/Header.svelte";
	import { getCharacterById } from "$lib/api";
	import { handleImageError } from "$lib/utils/image";
	import type { Character } from "$lib/types";

	const characterId = $derived($page.params.id ?? "");
	let character = $state<Character | null>(null);
	let loading = $state(true);

	$effect(() => {
		loadData();
	});

	async function loadData() {
		if (!characterId) return;
		loading = true;
		try {
			character = await getCharacterById(characterId);
		} catch (e) {
			console.error("Failed to load character:", e);
		} finally {
			loading = false;
		}
	}

	let cardElement: HTMLDivElement | undefined = $state();
	let bgHeight = $state(0);

	function goBack() {
		history.back();
	}

	async function saveImage() {
		if (!cardElement) return;
		try {
			const { toPng } = await import("html-to-image");
			const dataUrl = await toPng(cardElement, {
				cacheBust: true,
				pixelRatio: 2.5,
			});
			const link = document.createElement("a");
			link.download = `${character?.nickname ?? "card"}.png`;
			link.href = dataUrl;
			link.click();
		} catch (err) {
			console.error("이미지 저장 실패:", err);
		}
	}
</script>

<svelte:head>
	<title>카드 저장 - {character?.name ?? ""}</title>
</svelte:head>

<div class="absolute inset-0 bg-bg-overlay z-50 flex flex-col">
	<!-- Header -->
	<Header variant="save" onCloseClick={goBack} />

	<!-- Content Wrapper (Text, Card, Button) -->
	<div class="flex-1 flex flex-col items-center justify-center gap-2 py-8">
		{#if loading}
			<p class="text-white">로딩 중...</p>
		{:else if character}
			<span class="text-xs text-text-muted opacity-80"
				>내 캐릭터 카드를 저장해 보세요!</span
			>
			<div
				bind:this={cardElement}
				class="w-full max-w-[260px] relative bg-[linear-gradient(to_bottom,#FAC486,#F2A372)] rounded-[16px] p-2 flex flex-col items-center shadow-2xl overflow-hidden"
			>
				<!-- Top Text Logo -->
				<div
					class="w-full flex items-center justify-center shrink-0 mt-1 mb-2"
				>
					<img
						src="/images/logos/logo-text-white.svg"
						alt="단풍바람"
						class="h-[18px] object-contain"
						draggable="false"
					/>
				</div>

				<!-- Inner Content with Park Background -->
				<div
					class="relative w-full rounded-lg overflow-hidden flex flex-col justify-end border border-[#C15D39]"
				>
					<!-- Park Background -->
					<img
						src="/images/park-bg.png"
						alt="배경"
						class="w-full h-auto block z-0"
						bind:clientHeight={bgHeight}
						style="margin-bottom: -{bgHeight / 24}px;"
						onerror={(e) =>
							((e.currentTarget as HTMLImageElement).src =
								"https://via.placeholder.com/300x450/EEE/999?text=Park+Background")}
					/>

					<!-- Content Overlay Container -->
					<div
						class="absolute inset-0 z-20 flex flex-col justify-end pb-4"
					>
						<!-- Character Image -->
						<div
							class="absolute inset-x-0 flex items-center justify-center top-1/2 -translate-y-[60%]"
							style="margin-top: {bgHeight / 24}px;"
						>
							<img
								src={character.avatarUrl ||
									"/default-avatar.png"}
								alt={character.name}
								onerror={handleImageError}
								class="w-auto h-auto object-contain drop-shadow-lg"
								style="filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4)); transform: scale(2.2); image-rendering: pixelated; image-rendering: crisp-edges;"
							/>
						</div>

						<!-- Character Info (Bottom) -->
						<div
							class="relative flex flex-col items-center text-center w-full px-3 pt-8 mt-auto"
						>
							<p
								class="text-xl font-bold text-white mb-1 tracking-wide"
							>
								{character.name}
							</p>
							<p
								class="text-xs text-white/90 font-light tracking-wide"
							>
								{character.server} · {character.nickname ||
									character.name} · {character.job}
							</p>

							<div
								class="mt-3 px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm border border-white/10 flex items-center justify-center overflow-hidden"
							>
								<img
									src="/images/단풍바람 13기.svg"
									alt="단풍바람 13기"
									class="h-[10px] w-auto my-[1px]"
									draggable="false"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Save Button -->
			<div class="mt-2">
				<button
					onclick={saveImage}
					class="flex items-center gap-2 px-6 py-3 rounded-full border border-white/30 text-white hover:bg-white/10 transition-colors"
				>
					<Download size={16} />
					<span class="text-base">저장하기</span>
				</button>
			</div>
		{/if}
	</div>
</div>
