<script lang="ts">
	import type { TalkComment } from '$lib/types';

	interface Props {
		comment: TalkComment;
		onLongPress?: (comment: TalkComment) => void;
	}

	let { comment, onLongPress }: Props = $props();
	let longPressTimer: ReturnType<typeof setTimeout> | null = null;
	const LONG_PRESS_MS = 600;

	function startLongPress() {
		if (!comment.isMine) return;
		clearLongPress();
		longPressTimer = setTimeout(() => {
			onLongPress?.(comment);
			clearLongPress();
		}, LONG_PRESS_MS);
	}

	function clearLongPress() {
		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
		}
	}
</script>

<div
	class="flex flex-col gap-2 px-6 pt-4 bg-white"
	onpointerdown={startLongPress}
	onpointerup={clearLongPress}
	onpointerleave={clearLongPress}
	onpointercancel={clearLongPress}
>
	<div class="flex justify-between items-center">
		<div class="flex items-center gap-2">
			<span class="text-xs font-light text-text-primary">{comment.author}</span>
		</div>
		<span class="text-xs font-light text-text-muted">{comment.createdAt}</span>
	</div>
	<p class="text-sm font-light text-text-primary pb-4 border-b border-border">{comment.content}</p>
</div>
