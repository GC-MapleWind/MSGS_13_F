<script lang="ts">
	import type { TeamMessageItem } from "$lib/types";
	import { handleImageError } from "$lib/utils/image";

	interface Props {
		item: TeamMessageItem;
	}

	let { item }: Props = $props();
</script>

<a
	href="/team-message/{item.id}"
	class="flex items-center gap-4 px-6 py-4 bg-white border-b border-bg-light hover:bg-gray-50 focus:bg-gray-50 transition-none last:border-b-0"
>
	<div
		class="w-[4.5rem] h-[4.5rem] shrink-0 rounded-2xl overflow-hidden bg-bg-light shadow-sm"
	>
		<img
			src={item.imageUrl || "/logo.png"}
			alt={item.name}
			onerror={handleImageError}
			class={item.imageUrl
				? "w-full h-full object-cover"
				: "w-10 h-10 object-contain mx-auto mt-5"}
		/>
	</div>

	<div class="flex flex-col grow min-w-0 gap-1 ml-2">
		<span
			class="text-[17px] leading-tight text-text-primary font-semibold truncate"
			>{item.title}</span
		>
		<span class="text-[13px] font-normal text-[#9CA3AF]"
			>{item.name} {item.role}</span
		>
	</div>
</a>
