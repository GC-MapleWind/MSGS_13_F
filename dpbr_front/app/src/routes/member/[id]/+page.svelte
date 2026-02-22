<script lang="ts">
	import { onMount } from "svelte";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import Header from "$lib/components/Header.svelte";
	import SettlementListItem from "$lib/components/SettlementListItem.svelte";
	import { getCharacterById, getSettlementsByCharacterId } from "$lib/api";
	import { handleImageError } from "$lib/utils/image";
	import type { Character, SettlementItem } from "$lib/types";

	const characterId = $derived($page.params.id ?? "");
	let character = $state<Character | null>(null);
	let isAdminTeam = $derived(character?.name === "단풍바람 운영팀");
	let settlements = $state<SettlementItem[]>([]);
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
			const [charData, settlementsData] = await Promise.all([
				getCharacterById(characterId),
				getSettlementsByCharacterId(characterId),
			]);
			character = charData;
			settlements = settlementsData;
		} catch (e) {
			console.error("Failed to load character data:", e);
			error = "데이터를 불러오는데 실패했습니다.";
		} finally {
			loading = false;
		}
	}
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
	<div class="flex flex-col h-full">
		<Header
			variant="detail"
			title={isAdminTeam ? "운영팀 한마디 상세" : undefined}
			onBackClick={() => goto("/")}
		/>

		<div class="flex-1 overflow-y-auto">
			<!-- Character Info -->
			<div
				class="flex items-center gap-4 bg-white px-6 py-4 border-b border-border"
			>
				<div
					class="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-bg-light flex items-center justify-center"
				>
					<img
						src={isAdminTeam ? "/logo.png" : character.avatarUrl}
						alt={character.name}
						onerror={handleImageError}
						class={isAdminTeam
							? "w-10 h-10 object-contain"
							: "w-full h-full object-cover"}
					/>
				</div>
				<div class="flex flex-col grow min-w-0">
					<div class="flex items-center gap-2">
						<span class="text-base text-text-primary font-medium"
							>{character.name}</span
						>
						{#if !isAdminTeam}
							<span class="text-base text-text-primary"
								>{character.nickname}</span
							>
						{/if}
					</div>
					<div
						class="flex items-center gap-1 text-xs text-text-muted"
					>
						<span
							>{isAdminTeam
								? character.level + "기"
								: "Lv. " + character.level}</span
						>
						<div class="w-px h-1.5 bg-border-dark"></div>
						<span>{character.server}</span>
						<div class="w-px h-1.5 bg-border-dark"></div>
						<span>{character.job}</span>
					</div>
				</div>
				{#if !isAdminTeam}
					<a
						href="/member/{characterId}/save"
						class="shrink-0 flex items-center justify-center h-10 px-4 rounded-2xl border border-border-dark text-sm font-light text-text-secondary"
					>
						저장
					</a>
				{/if}
			</div>

			<!-- Settlement List -->
			<div class="bg-bg-light">
				<div class="flex items-center bg-white px-6 py-4">
					<span class="text-base font-medium text-text-primary"
						>{isAdminTeam
							? "단풍바람 운영팀 한마디 목록"
							: "획득한 메생결산 목록"}</span
					>
				</div>
				<div class="flex flex-col bg-white">
					{#if settlements.length > 0}
						{#each settlements as item (item.id)}
							<SettlementListItem {item} />
						{/each}
					{:else}
						<div class="flex items-center justify-center py-8">
							<p class="text-text-muted">메생결산이 없습니다.</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{:else}
	<div class="flex-1 flex items-center justify-center">
		<p class="text-text-muted">캐릭터를 찾을 수 없습니다.</p>
	</div>
{/if}
