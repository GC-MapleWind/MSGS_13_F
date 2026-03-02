<script lang="ts">
	import { toast } from "$lib/stores/toast";
	import { fade, slide } from "svelte/transition";

	let defaultToasts = $derived($toast.filter((t) => t.type !== "center"));
	let centerToasts = $derived($toast.filter((t) => t.type === "center"));
</script>

<!-- Default bottom toasts -->
<div
	class="fixed bottom-40 left-0 right-0 z-[100] flex flex-col items-center pointer-events-none gap-2 px-4"
>
	{#each defaultToasts as { id, message } (id)}
		<div
			in:slide={{ duration: 250 }}
			out:fade={{ duration: 200 }}
			class="bg-black/60 text-white px-6 py-2.5 rounded-3xl shadow-md text-[15px] font-medium text-center max-w-[90%] pointer-events-auto whitespace-pre-line"
		>
			{message}
		</div>
	{/each}
</div>

<!-- Centered toasts -->
<div
	class="fixed inset-0 z-[101] flex flex-col items-center justify-center pointer-events-none gap-2 px-4"
>
	{#each centerToasts as { id, message } (id)}
		<div
			in:slide={{ duration: 300, axis: "y" }}
			out:fade={{ duration: 200 }}
			class="bg-black/80 text-white px-8 py-6 rounded-3xl shadow-2xl text-[14px] font-medium text-center max-w-[90%] border border-white/20 pointer-events-auto whitespace-pre-line leading-relaxed"
		>
			{message}
		</div>
	{/each}
</div>
