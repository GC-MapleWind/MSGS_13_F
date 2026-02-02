<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="min-h-screen bg-bg-app flex justify-center">
	<div class="w-full max-w-3xl min-w-80 bg-white shadow-lg relative min-h-screen flex flex-col">
		{@render children()}
	</div>
</div>
