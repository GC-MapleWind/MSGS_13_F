<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { ChevronLeft, Send } from 'lucide-svelte';
	import CommentItem from '$lib/components/CommentItem.svelte';
	import { getComments, createComment, deleteComment } from '$lib/api';
	import { authStore } from '$lib/stores/auth';
	import type { TalkComment } from '$lib/types';

	let comments = $state<TalkComment[]>([]);
	let inputText = $state('');
	let guestNickname = $state('');
	let textareaEl: HTMLTextAreaElement | undefined = $state();
	let loading = $state(true);
	let submitting = $state(false);
	let deleting = $state(false);
	let error = $state<string | null>(null);
	let deleteTarget = $state<TalkComment | null>(null);

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

		const isAuthenticated = $authStore.isAuthenticated;
		const nickname = guestNickname.trim();

		if (!isAuthenticated && nickname) {
			if (nickname.length < 2 || nickname.length > 10 || !/^[a-zA-Z0-9가-힣]+$/.test(nickname)) {
				alert('닉네임은 2~10자, 한글/영문/숫자만 가능합니다.');
				return;
			}
		}

		submitting = true;
		try {
			const newComment = await createComment(text, isAuthenticated ? undefined : nickname);
			
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
				}),
				userId: newComment.user_id,
				isMine: newComment.is_mine ?? true
			};
			
			comments = [formattedComment, ...comments];
			inputText = '';
			if (textareaEl) {
				textareaEl.style.height = 'auto';
			}
		} catch (e) {
			console.error('Failed to create comment:', e);
			const message = e instanceof Error ? e.message : '댓글 작성에 실패했습니다.';
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

	function openDeleteModal(comment: TalkComment) {
		if (!comment.isMine) return;
		deleteTarget = comment;
	}

	function closeDeleteModal() {
		if (deleting) return;
		deleteTarget = null;
	}

	function handleDeleteModalBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			closeDeleteModal();
		}
	}

	function handleDeleteModalKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			closeDeleteModal();
		}
	}

	async function confirmDelete() {
		if (!deleteTarget || deleting) return;

		deleting = true;
		try {
			await deleteComment(deleteTarget.id);
			comments = comments.filter((comment) => comment.id !== deleteTarget?.id);
			deleteTarget = null;
		} catch (e) {
			console.error('Failed to delete comment:', e);
			const message = e instanceof Error ? e.message : '댓글 삭제에 실패했습니다.';
			alert(message);
		} finally {
			deleting = false;
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
					<CommentItem {comment} onLongPress={openDeleteModal} />
				{/each}
			</div>
		{/if}
	</div>

	<!-- Input Area -->
	<div class="bg-white px-6 py-2 border-t border-border space-y-2">
		{#if !$authStore.isAuthenticated}
			<input
				type="text"
				bind:value={guestNickname}
				maxlength="10"
				placeholder="비로그인 닉네임 (선택, 비워두면 랜덤 닉네임)"
				class="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none"
			/>
		{:else}
			<p class="px-1 text-xs text-text-muted">로그인 상태로 작성하면 계정 닉네임/이름으로 등록됩니다.</p>
		{/if}
		<div class="flex items-end gap-4">
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
</div>

{#if deleteTarget}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onclick={handleDeleteModalBackdropClick}
		onkeydown={handleDeleteModalKeydown}
	>
		<div class="w-[280px] rounded-2xl bg-white p-5">
			<p class="mb-5 text-center text-base text-text-primary">삭제하시겠습니까?</p>
			<div class="flex gap-2">
				<button
					type="button"
					onclick={closeDeleteModal}
					class="flex-1 rounded-xl border border-border px-3 py-2 text-sm"
					disabled={deleting}
				>
					뒤로가기
				</button>
				<button
					type="button"
					onclick={confirmDelete}
					class="flex-1 rounded-xl bg-red-500 px-3 py-2 text-sm text-white disabled:opacity-60"
					disabled={deleting}
				>
					{deleting ? '삭제 중...' : '삭제'}
				</button>
			</div>
		</div>
	</div>
{/if}
