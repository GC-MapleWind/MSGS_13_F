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
		class="bg-white shadow-lg relative flex flex-col h-[calc(100vh-40px)] aspect-[768/874] max-w-[768px] min-w-[320px] overflow-hidden"
	>
		{@render children()}
	</div>
</div>
