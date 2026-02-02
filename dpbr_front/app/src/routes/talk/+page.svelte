<script lang="ts">
	import { goto } from '$app/navigation';
	import { ChevronLeft, Send } from 'lucide-svelte';
	import CommentItem from '$lib/components/CommentItem.svelte';
	import { talkComments } from '$lib/data';
	import type { TalkComment } from '$lib/types';

	let comments = $state<TalkComment[]>([...talkComments]);
	let inputText = $state('');
	let textareaEl: HTMLTextAreaElement | undefined = $state();

	function adjustTextarea() {
		if (!textareaEl) return;
		textareaEl.style.height = 'auto';
		const lineHeight = 24;
		const maxHeight = lineHeight * 4.5;
		textareaEl.style.height = Math.min(textareaEl.scrollHeight, maxHeight) + 'px';
		textareaEl.style.overflowY = textareaEl.scrollHeight > maxHeight ? 'auto' : 'hidden';
	}

	function submitComment() {
		const text = inputText.trim();
		if (!text) return;

		const now = new Date();
		const pad = (n: number) => String(n).padStart(2, '0');
		const dateStr = `${String(now.getFullYear()).slice(2)}. ${pad(now.getMonth() + 1)}. ${pad(now.getDate())}. ${pad(now.getHours())}:${pad(now.getMinutes())}`;

		const newComment: TalkComment = {
			id: `talk-${Date.now()}`,
			author: '익명',
			authorAvatar: 'https://placehold.co/40x40/E0E0E0/666?text=ME',
			content: text,
			createdAt: dateStr
		};

		comments = [newComment, ...comments];
		inputText = '';
		if (textareaEl) {
			textareaEl.style.height = 'auto';
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			submitComment();
		}
	}
</script>

<svelte:head>
	<title>메생결산 톡 - 단풍바람</title>
</svelte:head>

<!-- Header -->
<header class="flex items-center gap-2 bg-primary-dark px-3 py-2 sticky top-0 z-30">
	<button onclick={() => goto('/')} class="p-2 text-white" aria-label="뒤로가기">
		<ChevronLeft size={24} />
	</button>
	<span class="text-base font-medium text-white">메생결산 톡</span>
</header>

<!-- Comment Count -->
<div class="flex items-center bg-white px-6 py-5">
	<div class="flex items-center gap-1">
		<span class="text-base text-text-primary">톡</span>
		<span class="text-base text-primary-dark">{comments.length.toLocaleString()}</span>
	</div>
</div>

<!-- Comment List -->
<div class="flex-1 bg-bg-light overflow-y-auto">
	<div class="flex flex-col">
		{#each comments as comment (comment.id)}
			<CommentItem {comment} />
		{/each}
	</div>
</div>

<!-- Input Area -->
<div
	class="flex items-end gap-4 bg-white px-6 py-2 border-t border-border sticky bottom-0 z-20"
>
	<div class="flex items-end grow bg-bg-light rounded-3xl px-4 py-2">
		<textarea
			bind:this={textareaEl}
			bind:value={inputText}
			oninput={adjustTextarea}
			onkeydown={handleKeydown}
			placeholder="댓글을 남겨 보세요."
			rows={1}
			class="w-full bg-transparent text-base text-text-primary placeholder-text-muted outline-none resize-none leading-6"
			style="overflow-y: hidden;"
		></textarea>
	</div>
	<button
		onclick={submitComment}
		class="w-10 h-10 flex items-center justify-center rounded-full shrink-0 text-primary-dark hover:bg-bg-light transition-colors"
		aria-label="댓글 보내기"
	>
		<Send size={20} />
	</button>
</div>
