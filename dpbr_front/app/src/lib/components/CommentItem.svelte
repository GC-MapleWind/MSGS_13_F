<script lang="ts">
	import type { TalkComment } from '$lib/types';

	interface Props {
		comment: TalkComment;
	}

	let { comment }: Props = $props();
</script>

<div class="flex flex-col gap-2 px-6 pt-4 bg-white">
	<div class="flex justify-between items-center">
		<div class="flex items-center gap-2">
			<span class="text-xs font-light text-text-primary">{comment.author}</span>
		</div>
		<span class="text-xs font-light text-text-muted">{comment.createdAt}</span>
	</div>
	<p class="text-sm font-light text-text-primary pb-4 border-b border-border">{comment.content}</p>
</div>
