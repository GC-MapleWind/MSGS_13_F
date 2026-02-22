<script lang="ts">
	import type { SettlementItem } from "$lib/types";
	import { handleImageError } from "$lib/utils/image";

	interface Props {
		item: SettlementItem;
		isAdminTeam?: boolean;
	}

	let { item, isAdminTeam = false }: Props = $props();

	function formatDate(dateStr: string): string {
		const d = new Date(dateStr);
		return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 획득`;
	}
</script>

<a
	href="/msg/{item.id}"
	class="flex items-center gap-4 px-6 py-4 bg-white border-b border-border hover:bg-bg-light transition-colors"
>
	<!-- Thumbnail -->
	<div class="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-bg-light">
		<img
			src={item.imageUrl || (isAdminTeam ? "/logo.png" : "")}
			alt={item.title}
			onerror={handleImageError}
			class={isAdminTeam && !item.imageUrl
				? "w-10 h-10 object-contain mx-auto mt-5"
				: "w-full h-full object-cover"}
		/>
	</div>

	<!-- Text -->
	<div class="flex flex-col grow min-w-0 gap-1">
		<span class="text-base text-text-primary truncate">{item.title}</span>
		<span class="text-sm font-light text-text-muted">
			{isAdminTeam
				? item.title.split(" ")[1] || item.title
				: formatDate(item.acquiredAt)}
		</span>
	</div>
</a>
