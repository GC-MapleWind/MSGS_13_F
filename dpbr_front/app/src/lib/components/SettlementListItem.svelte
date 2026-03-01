<script lang="ts">
	import type { SettlementItem } from "$lib/types";
	import { handleImageError } from "$lib/utils/image";

	interface Props {
		item: SettlementItem;
	}

	let { item }: Props = $props();

	function formatDate(dateStr: string): string {
		const d = new Date(dateStr);
		return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 획득`;
	}
</script>

<a
	href="/msg/{item.id}"
	class="flex items-center gap-4 px-6 py-4 bg-white border-b border-bg-light hover:bg-gray-50 focus:bg-gray-50 transition-none last:border-b-0 touch-none select-none"
	style="-webkit-touch-callout: none;"
	draggable="false"
>
	<!-- Thumbnail -->
	<div
		class="w-[4.5rem] h-[4.5rem] shrink-0 rounded-2xl overflow-hidden bg-bg-light shadow-sm"
	>
		<img
			src={item.imageUrl}
			alt={item.title}
			onerror={handleImageError}
			class="w-full h-full object-cover"
		/>
	</div>

	<!-- Text -->
	<div class="flex flex-col grow min-w-0 gap-1.5 ml-2">
		<span
			class="text-[17px] leading-tight text-text-primary font-semibold truncate"
			>{item.title}</span
		>
		<span class="text-[13px] font-normal text-[#9CA3AF]">{formatDate(item.acquiredAt)}</span>
	</div>
</a>
