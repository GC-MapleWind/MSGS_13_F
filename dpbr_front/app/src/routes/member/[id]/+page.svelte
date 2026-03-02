<script lang="ts">
	import { tick } from "svelte";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import Header from "$lib/components/Header.svelte";
	import SettlementListItem from "$lib/components/SettlementListItem.svelte";
	import TeamMessageListItem from "$lib/components/TeamMessageListItem.svelte";
	import {
		getAdminCharacter,
		getCharacterById,
		getSettlementsByCharacterId,
		getSettlementsByCharacterIdPaginated,
		getTeamMembers,
	} from "$lib/api";
	import { handleImageError } from "$lib/utils/image";
	import type {
		Character,
		SettlementItem,
		TeamMessageItem,
	} from "$lib/types";
	import type { Snapshot } from "./$types";

	const ADMIN_TEAM_INFO = {
		generation: "13기",
		university: "가천대학교",
		role: "운영팀",
	};

	const ADMIN_TEAM_NAME = "단풍바람 운영팀";
	const ADMIN_TEAM_FALLBACK_ID = "admin-team";

	const fallbackAdminCharacter: Character = {
		id: ADMIN_TEAM_FALLBACK_ID,
		name: ADMIN_TEAM_NAME,
		nickname: "운영팀",
		avatarUrl: "/logo.png",
		level: 0,
		job: "운영",
		club: "단풍바람",
		server: "-",
	};

	const characterId = $derived($page.params.id ?? "");
	let character = $state<Character | null>(null);
	let isAdminTeam = $derived(
		characterId === ADMIN_TEAM_FALLBACK_ID ||
			character?.name === ADMIN_TEAM_NAME,
	);
	let settlements = $state<SettlementItem[]>([]);
	let settlementsLoadingMore = $state(false);
	let settlementsHasMore = $state(false);
	let settlementsPage = $state(1);
	const settlementsLimit = 10;
	let settlementsSentinel = $state<HTMLDivElement | null>(null);
	let teamMessages = $state<TeamMessageItem[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	let scrollContainer = $state<HTMLDivElement | null>(null);
	let restoredScrollTop = 0;
	let restoredCharacterId = "";

	function uniqueById<T extends { id: string }>(items: T[]): T[] {
		const seen = new Set<string>();
		return items.filter((item) => {
			if (seen.has(item.id)) return false;
			seen.add(item.id);
			return true;
		});
	}

	export const snapshot: Snapshot = {
		capture: () => ({
			character,
			settlements,
			settlementsPage,
			settlementsHasMore,
			teamMessages,
			scrollTop: scrollContainer?.scrollTop ?? 0,
			charId: characterId,
		}),
		restore: (value) => {
			character = value.character;
			settlements = uniqueById(value.settlements);
			settlementsPage = value.settlementsPage;
			settlementsHasMore = value.settlementsHasMore;
			teamMessages = uniqueById(value.teamMessages);
			restoredScrollTop = value.scrollTop;
			restoredCharacterId = value.charId;
		},
	};

	$effect(() => {
		// characterId가 변경될 때마다 데이터 로드
		if (restoredCharacterId === characterId && character) {
			loading = false;
			if (scrollContainer && restoredScrollTop > 0) {
				tick().then(() => {
					if (scrollContainer) {
						scrollContainer.scrollTop = restoredScrollTop;
					}
				});
			}
			// Reset restored ID after use to allow normal loads if ID changes later
			restoredCharacterId = "";
			return;
		}
		loadData();
	});

	async function loadData() {
		if (!characterId) return;

		loading = true;
		error = null;

		try {
			if (characterId === ADMIN_TEAM_FALLBACK_ID) {
				const adminCharacter = await getAdminCharacter();
				if (adminCharacter.id !== null) {
					const adminData = await getCharacterById(
						adminCharacter.id.toString(),
					);
					character = adminData || fallbackAdminCharacter;
				} else {
					character = fallbackAdminCharacter;
				}
				teamMessages = uniqueById(await getTeamMembers());

				settlements = [];
				settlementsHasMore = false;
				return;
			}

			const charData = await getCharacterById(characterId);
			character = charData;
			if (!charData) {
				settlements = [];
				settlementsHasMore = false;
				teamMessages = [];
				return;
			}

			if (charData.name === ADMIN_TEAM_NAME) {
				teamMessages = uniqueById(await getTeamMembers());

				settlements = [];
				settlementsHasMore = false;
			} else {
				teamMessages = [];
				settlements = [];
				settlementsPage = 1;
				settlementsHasMore = true;
				await loadMoreSettlements(characterId);
			}
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

			settlements = uniqueById([...settlements, ...result.items]);
			settlementsHasMore =
				settlements.length < result.total && result.items.length > 0;
			if (result.items.length > 0) {
				settlementsPage += 1;
			}
		} catch (e) {
			if (
				e instanceof Error &&
				e.message.includes("API Error: 404") &&
				settlementsPage === 1
			) {
				const fallbackItems =
					await getSettlementsByCharacterId(targetCharacterId);
				settlements = uniqueById(fallbackItems);
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
		if (!settlementsSentinel || !settlementsHasMore || isAdminTeam) return;

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
			title={isAdminTeam ? "운영팀 한마디 상세" : "메생결산 상세"}
			onBackClick={() => history.back()}
		/>

		<div
			bind:this={scrollContainer}
			class="flex-1 overflow-y-auto flex flex-col gap-2 pb-8"
		>
			<!-- Character Info -->
			<div class="flex items-center gap-4 bg-white px-6 py-5">
				<div
					class="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-bg-light flex items-center justify-center"
				>
					<img
						src={isAdminTeam ? "/logo.png" : character.avatarUrl}
						alt={character.name}
						onerror={handleImageError}
						class={isAdminTeam
							? "w-10 h-10 object-contain"
							: "w-full h-full object-cover [image-rendering:pixelated]"}
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
								? ADMIN_TEAM_INFO.generation
								: "Lv. " + character.level}</span
						>
						<div class="w-px h-1.5 bg-border-dark"></div>
						<span
							>{isAdminTeam
								? ADMIN_TEAM_INFO.university
								: character.server}</span
						>
						<div class="w-px h-1.5 bg-border-dark"></div>
						<span
							>{isAdminTeam
								? ADMIN_TEAM_INFO.role
								: character.job}</span
						>
					</div>
				</div>
				{#if !isAdminTeam}
					<a
						href="/member/{characterId}/save"
						class="shrink-0 flex items-center justify-center h-10 px-4 rounded-2xl border border-border-dark text-sm font-light text-text-secondary hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-200 transition-none"
					>
						저장
					</a>
				{/if}
			</div>

			<div class="bg-white flex flex-col pb-2">
				<div
					class="flex items-center px-6 py-5 border-b border-bg-light"
				>
					<span class="text-base font-medium text-text-primary"
						>{isAdminTeam
							? "단풍바람 운영팀 한마디 목록"
							: "획득한 메생결산 목록"}</span
					>
				</div>
				<div class="flex flex-col">
					{#if isAdminTeam ? teamMessages.length > 0 : settlements.length > 0}
						{#if isAdminTeam}
							{#each teamMessages as item (item.id)}
								<TeamMessageListItem {item} />
							{/each}
						{:else}
							{#each settlements as item (item.id)}
								<SettlementListItem {item} />
							{/each}
							{#if settlementsHasMore}
								<div
									bind:this={settlementsSentinel}
									class="py-4 flex items-center justify-center"
								>
									{#if settlementsLoadingMore}
										<p class="text-text-muted text-sm">
											불러오는 중...
										</p>
									{/if}
								</div>
							{/if}
						{/if}
					{:else}
						<div class="flex items-center justify-center py-8">
							<p class="text-text-muted">
								{isAdminTeam
									? "운영팀 정보가 없습니다."
									: "메생결산이 없습니다."}
							</p>
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
