<script lang="ts">
	import { toast } from "$lib/stores/toast";
	import { fade, slide } from "svelte/transition";
</script>

<div
	class="fixed bottom-40 left-0 right-0 z-[100] flex flex-col items-center pointer-events-none gap-2 px-4"
>
	{#each $toast as { id, message } (id)}
		<div
			in:slide={{ duration: 250 }}
			out:fade={{ duration: 200 }}
			class="bg-black/60 text-white px-6 py-2.5 rounded-3xl shadow-md text-[15px] font-medium text-center max-w-[90%] pointer-events-auto whitespace-nowrap"
		>
			{message}
		</div>
	{/each}
</div>
