<script lang="ts">
	import { toast } from "$lib/stores/toast";
	import { fade, slide } from "svelte/transition";
</script>

<div
	class="fixed top-12 left-0 right-0 z-50 flex flex-col items-center pointer-events-none gap-2 px-4"
>
	{#each $toast as { id, message } (id)}
		<div
			in:slide={{ duration: 250 }}
			out:fade={{ duration: 200 }}
			class="bg-[rgba(124,107,89,0.95)] text-white px-6 py-3 rounded-full shadow-md text-sm text-center max-w-[90%] pointer-events-auto"
		>
			{message}
		</div>
	{/each}
</div>
