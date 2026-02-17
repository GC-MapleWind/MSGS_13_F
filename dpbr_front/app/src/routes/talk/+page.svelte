<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { ChevronLeft, Send } from 'lucide-svelte';
	import CommentItem from '$lib/components/CommentItem.svelte';
	import { getComments, createComment } from '$lib/api';
	import { authStore } from '$lib/stores/auth';
	import type { TalkComment } from '$lib/types';

	let comments = $state<TalkComment[]>([]);
	let inputText = $state('');
	let textareaEl: HTMLTextAreaElement | undefined = $state();
	let loading = $state(true);
	let submitting = $state(false);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			comments = await getComments();
		} catch (e) {
			console.error('Failed to load comments:', e);
			error = '댓글을 불러오는데 실패했습니다.';
		} finally {
			loading = false;
		}
	});

	function adjustTextarea() {
		if (!textareaEl) return;
		textareaEl.style.height = 'auto';
		const lineHeight = 24;
		const maxHeight = lineHeight * 4.5;
		textareaEl.style.height = Math.min(textareaEl.scrollHeight, maxHeight) + 'px';
		textareaEl.style.overflowY = textareaEl.scrollHeight > maxHeight ? 'auto' : 'hidden';
	}

	async function submitComment() {
		const text = inputText.trim();
		if (!text || submitting) return;

		submitting = true;
		try {
			const newComment = await createComment(text);
			
			// 새 댓글을 목록 맨 위에 추가
			const formattedComment: TalkComment = {
				id: newComment.id.toString(),
				author: newComment.author,
				authorAvatar: '/default-avatar.png',
				content: newComment.content,
				createdAt: new Date(newComment.created_at).toLocaleString('ko-KR', {
					year: '2-digit',
					month: '2-digit',
					day: '2-digit',
					hour: '2-digit',
					minute: '2-digit'
				})
			};
			
			comments = [formattedComment, ...comments];
			inputText = '';
			if (textareaEl) {
				textareaEl.style.height = 'auto';
			}
		} catch (e) {
			console.error('Failed to create comment:', e);
			const message = e instanceof Error ? e.message : '댓글 작성에 실패했습니다.';

			if (message.includes('401') || message.includes('로그인이 필요합니다')) {
				await authStore.logout();
				alert('로그인이 필요합니다. 다시 로그인해 주세요.');
				await goto('/login');
				return;
			}

			alert(message);
		} finally {
			submitting = false;
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

<div class="flex flex-col h-full">
	<!-- Header -->
	<header class="flex items-center gap-2 bg-primary-dark px-3 py-2">
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
	<div class="flex-1 bg-bg-light overflow-y-auto min-h-0">
		{#if loading}
			<div class="flex items-center justify-center h-full">
				<p class="text-text-muted">로딩 중...</p>
			</div>
		{:else if error}
			<div class="flex items-center justify-center h-full">
				<p class="text-text-muted">{error}</p>
			</div>
		{:else}
			<div class="flex flex-col">
				{#each comments as comment (comment.id)}
					<CommentItem {comment} />
				{/each}
			</div>
		{/if}
	</div>

	<!-- Input Area -->
	<div class="flex items-end gap-4 bg-white px-6 py-2 border-t border-border">
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
			disabled={submitting}
			class="w-10 h-10 flex items-center justify-center rounded-full shrink-0 text-primary-dark hover:bg-bg-light transition-colors disabled:opacity-50"
			aria-label="댓글 보내기"
		>
			{#if submitting}
				<span class="text-xs">...</span>
			{:else}
				<Send size={20} />
			{/if}
		</button>
	</div>
</div>
