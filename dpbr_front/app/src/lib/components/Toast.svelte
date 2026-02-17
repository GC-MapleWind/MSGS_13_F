<script lang="ts">
	import { fade } from 'svelte/transition';

	interface Props {
		message: string;
		duration?: number;
		show: boolean;
		onClose: () => void;
	}

	let { message, duration = 3000, show, onClose }: Props = $props();

	let timeoutId: ReturnType<typeof setTimeout> | null = $state(null);

	$effect(() => {
		if (show) {
			// 기존 타이머 클리어
			if (timeoutId) {
				clearTimeout(timeoutId);
			}

			// duration 후 자동으로 닫기
			timeoutId = setTimeout(() => {
				onClose();
			}, duration);
		}

		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
	});
</script>

{#if show}
	<div
		class="fixed top-[54px] left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-gray-600 text-white rounded-lg shadow-lg max-w-[90%]"
		transition:fade={{ duration: 0.5 }}
		role="alert"
		aria-live="assertive"
	>
		{message}
	</div>
{/if}
