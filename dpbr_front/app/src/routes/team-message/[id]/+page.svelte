<script lang="ts">
	import { page } from "$app/stores";
	import Header from "$lib/components/Header.svelte";
	import { getTeamMessageDetail } from "$lib/api";
	import { handleImageError } from "$lib/utils/image";
	import type { TeamMessageItem } from "$lib/types";

	const teamMessageId = $derived($page.params.id ?? "");
	let teamMessage = $state<TeamMessageItem | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	$effect(() => {
		loadData();
	});

	async function loadData() {
		if (!teamMessageId) return;

		loading = true;
		error = null;

		try {
			teamMessage = await getTeamMessageDetail(teamMessageId);
		} catch (e) {
			console.error("Failed to load team message data:", e);
			error = "데이터를 불러오는데 실패했습니다.";
		} finally {
			loading = false;
		}
	}

	function goBack() {
		history.back();
	}
</script>

<svelte:head>
	<title>{teamMessage?.name ?? "운영팀 한마디"} - 단풍바람</title>
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
	{:else if teamMessage}
		<div class="flex-1 flex flex-col bg-white overflow-y-auto">
			<div class="flex justify-center items-center bg-white px-6 py-4">
				<img
					src={teamMessage.imageUrl || "/logo.png"}
					alt={teamMessage.name}
					onerror={handleImageError}
					class={teamMessage.imageUrl
						? "w-full max-h-80 object-cover rounded-lg"
						: "w-1/2 object-contain rounded-lg"}
				/>
			</div>

			<div class="flex flex-col gap-4 px-6 pt-4">
				<div class="flex gap-4">
					<span class="text-sm font-light text-text-muted shrink-0">직책</span>
					<span class="text-base text-text-primary">{teamMessage.role}</span>
				</div>
			</div>

			<div class="flex flex-col gap-4 px-6 pt-4 pb-6">
				<div class="flex gap-4">
					<span class="text-sm font-light text-text-muted shrink-0">상세 내용</span>
					<span class="text-base text-text-primary leading-relaxed"
						>{teamMessage.content || teamMessage.title}</span
					>
				</div>
			</div>
		</div>
	{:else}
		<div class="flex-1 flex items-center justify-center">
			<p class="text-text-muted">운영팀 한마디를 찾을 수 없습니다.</p>
		</div>
	{/if}
</div>
