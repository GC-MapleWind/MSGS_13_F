<script lang="ts">
	import { page } from '$app/stores';
	import Header from '$lib/components/Header.svelte';
	import { getSettlementById } from '$lib/api';
	import { handleImageError } from '$lib/utils/image';
	import type { SettlementItem } from '$lib/types';

	const msgId = $derived($page.params.id ?? '');
	let settlement = $state<SettlementItem | null>(null);
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
		
		try {
			settlement = await getSettlementById(msgId);
		} catch (e) {
			console.error('Failed to load settlement:', e);
			error = '데이터를 불러오는데 실패했습니다.';
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
	<title>{settlement?.title ?? '결산 상세'} - 단풍바람</title>
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
				src={settlement.imageUrl}
				alt={settlement.title}
				onerror={handleImageError}
				class="w-full max-h-80 object-cover rounded-lg"
			/>
		</div>

		<!-- Info -->
		<div class="flex flex-col gap-4 px-6 pt-4">
			<div class="flex gap-4">
				<span class="text-sm font-light text-text-muted shrink-0">획득 일자</span>
				<span class="text-base text-text-primary">{formatDate(settlement.acquiredAt)}</span>
			</div>
		</div>

		<div class="flex flex-col gap-4 px-6 pt-4 pb-6">
			<div class="flex gap-4">
				<span class="text-sm font-light text-text-muted shrink-0">상세 내용</span>
				<span class="text-base text-text-primary leading-relaxed">{settlement.description}</span>
			</div>
		</div>
		</div>
	{:else}
		<div class="flex-1 flex items-center justify-center">
			<p class="text-text-muted">결산 항목을 찾을 수 없습니다.</p>
		</div>
	{/if}
</div>
