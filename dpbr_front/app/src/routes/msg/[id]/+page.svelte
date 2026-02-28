<script lang="ts">
	import { page } from "$app/stores";
	import Header from "$lib/components/Header.svelte";
	import {
		getSettlementById,
		getCharacterById,
		getTeamMemberDetail,
	} from "$lib/api";
	import { handleImageError } from "$lib/utils/image";
	import type { SettlementItem, Character } from "$lib/types";

	const msgId = $derived($page.params.id ?? "");
	let settlement = $state<SettlementItem | null>(null);
	let character = $state<Character | null>(null);
	let isTeamMember = $state(false);
	let isAdminTeam = $derived(
		character?.name === "단풍바람 운영팀" || isTeamMember,
	);
	let loading = $state(true);
	let error = $state<string | null>(null);

	$effect(() => {
		// msgId가 변경될 때마다 데이터 로드
		loadData();
	});

	async function loadData() {
		if (!msgId) return;

		loading = true;
		error = null;
		isTeamMember = false;

		try {
			if (msgId.startsWith("team-")) {
				isTeamMember = true;
				const memberId = parseInt(msgId.slice(5), 10);
				if (Number.isNaN(memberId)) {
					settlement = null;
					error = "유효하지 않은 운영팀 멤버 ID입니다.";
					return;
				}
				settlement = await getTeamMemberDetail(memberId);
			} else {
				settlement = await getSettlementById(msgId);
				if (settlement) {
					character = await getCharacterById(settlement.characterId);
				}
			}
		} catch (e) {
			console.error("Failed to load data:", e);
			error = "데이터를 불러오는데 실패했습니다.";
		} finally {
			loading = false;
		}
	}

	function formatDate(dateStr: string): string {
		const d = new Date(dateStr);
		return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 획득`;
	}

	function goBack() {
		history.back();
	}
</script>

<svelte:head>
	<title>{settlement?.title ?? "결산 상세"} - 단풍바람</title>
</svelte:head>

<div class="flex flex-col h-full">
	<Header variant="close" onCloseClick={goBack} />

	{#if loading}
		<div class="flex-1 flex items-center justify-center">
			<p class="text-text-muted">로딩 중...</p>
		</div>
	{:else if error}
		<div class="flex-1 flex items-center justify-center">
			<p class="text-text-muted">{error}</p>
		</div>
	{:else if settlement}
		<div class="flex-1 flex flex-col bg-white overflow-y-auto">
			<!-- Main Image -->
			<div class="flex justify-center items-center bg-white px-6 py-4">
				<img
					src={settlement.imageUrl ||
						(isAdminTeam ? "/logo.png" : "/default-avatar.png")}
					alt={settlement.title}
					onerror={handleImageError}
					class={isAdminTeam && !settlement.imageUrl
						? "w-1/2 h-auto object-contain rounded-lg"
						: "w-full h-auto object-contain rounded-lg"}
				/>
			</div>

			<!-- Info -->
			<div class="flex flex-col gap-4 px-6 py-4">
				<div class="flex gap-4">
					<span
						class="text-sm font-light text-text-muted shrink-0 w-[72px] text-left whitespace-nowrap"
						>{isAdminTeam ? "직책" : "획득 일자"}</span
					>
					<span class="text-base text-text-primary"
						>{isAdminTeam
							? settlement.title
							: formatDate(settlement.acquiredAt)}</span
					>
				</div>
			</div>

			<hr class="border-bg-light mx-6" />

			<div class="flex flex-col gap-4 px-6 py-4">
				<div class="flex gap-4">
					<span
						class="text-sm font-light text-text-muted shrink-0 w-[72px] text-left whitespace-nowrap"
						>상세 내용</span
					>
					<span class="text-base text-text-primary leading-relaxed"
						>{settlement.title}</span
					>
				</div>
			</div>

			<hr class="border-bg-light mx-6" />
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
	{:else}
		<div class="flex-1 flex items-center justify-center">
			<p class="text-text-muted">결산 항목을 찾을 수 없습니다.</p>
		</div>
	{/if}
</div>
