<script lang="ts">
	import type { TalkComment } from '$lib/types';

	interface Props {
		comment: TalkComment;
		onLongPress?: (comment: TalkComment) => void;
	}

	let { comment, onLongPress }: Props = $props();
	let longPressTimer: ReturnType<typeof setTimeout> | null = null;
	let pointerStart: { x: number; y: number } | null = null;
	const LONG_PRESS_MS = 600;
	const MOVE_CANCEL_PX = 10;

	function startLongPress(event: PointerEvent) {
		if (!comment.isMine) return;
		clearLongPress();
		pointerStart = { x: event.clientX, y: event.clientY };
		longPressTimer = setTimeout(() => {
			onLongPress?.(comment);
			clearLongPress();
		}, LONG_PRESS_MS);
	}

	function handlePointerMove(event: PointerEvent) {
		if (!pointerStart || !longPressTimer) return;
		const movedX = Math.abs(event.clientX - pointerStart.x);
		const movedY = Math.abs(event.clientY - pointerStart.y);
		if (movedX > MOVE_CANCEL_PX || movedY > MOVE_CANCEL_PX) {
			clearLongPress();
		}
	}

	function clearLongPress() {
		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
		}
		pointerStart = null;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!comment.isMine) return;
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onLongPress?.(comment);
		}
	}
</script>

<div
	class="flex flex-col gap-2 px-6 pt-4 bg-white"
	role={comment.isMine ? 'button' : 'article'}
	tabindex={comment.isMine ? 0 : -1}
	aria-label={comment.isMine ? '내 댓글 삭제 메뉴 열기' : '댓글'}
	onkeydown={handleKeydown}
	onpointerdown={startLongPress}
	onpointermove={handlePointerMove}
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
