<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="h-screen bg-bg-app flex justify-center items-center overflow-hidden">
	<div
		class="bg-white shadow-lg relative flex flex-col h-full w-full max-w-3xl overflow-hidden"
	>
		{@render children()}
	</div>
</div>
