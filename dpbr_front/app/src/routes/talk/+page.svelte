<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { get } from "svelte/store";
	import { ChevronLeft, Send } from "lucide-svelte";
	import CommentItem from "$lib/components/CommentItem.svelte";
	import BottomSheetLogin from "$lib/components/BottomSheetLogin.svelte";
	import { getComments, createComment } from "$lib/api";
	import { authStore } from "$lib/stores/auth";
	import { toast } from "$lib/stores/toast";
	import type { TalkComment } from "$lib/types";

	let comments = $state<TalkComment[]>([]);
	let inputText = $state("");
	let textareaEl: HTMLTextAreaElement | undefined = $state();
	let loading = $state(true);
	let submitting = $state(false);
	let error = $state<string | null>(null);
	let showLoginBottomSheet = $state(false);

	onMount(async () => {
		try {
			comments = await getComments();
		} catch (e) {
			console.error("Failed to load comments:", e);
			error = "톡을 불러오는데 실패했습니다.";
		} finally {
			loading = false;
		}
	});

	function adjustTextarea() {
		if (!textareaEl) return;
		textareaEl.style.height = "auto";
		const lineHeight = 24;
		const maxHeight = lineHeight * 4.5;
		textareaEl.style.height =
			Math.min(textareaEl.scrollHeight, maxHeight) + "px";
		textareaEl.style.overflowY =
			textareaEl.scrollHeight > maxHeight ? "auto" : "hidden";
	}

	function openLoginPopup(): void {
		showLoginBottomSheet = true;
	}

	function closeLoginPopup(): void {
		showLoginBottomSheet = false;
	}

	async function handleLoginSuccess() {
		// 로그인 성공 후 데이터 다시 불러오기
		try {
			loading = true;
			comments = await getComments();
		} catch (e) {
			console.error("Failed to reload comments after login:", e);
		} finally {
			loading = false;
		}
	}

	async function submitComment() {
		const text = inputText.trim();
		if (!text || submitting) return;

		if (!get(authStore).isAuthenticated) {
			await openLoginPopup();
			return;
		}

		submitting = true;
		try {
			const newComment = await createComment(text);

			// 새 댓글을 목록 맨 위에 추가
			const formattedComment: TalkComment = {
				id: newComment.id.toString(),
				userId:
					newComment.user_id !== null
						? newComment.user_id.toString()
						: null,
				author: newComment.author,
				authorAvatar: "/default-avatar.png",
				content: newComment.content,
				createdAt: new Date(newComment.created_at).toLocaleString(
					"ko-KR",
					{
						year: "2-digit",
						month: "2-digit",
						day: "2-digit",
						hour: "2-digit",
						minute: "2-digit",
					},
				),
			};

			comments = [formattedComment, ...comments];
			inputText = "";
			if (textareaEl) {
				textareaEl.style.height = "auto";
			}
		} catch (e) {
			console.error("Failed to create comment:", e);
			const message =
				e instanceof Error ? e.message : "톡 작성에 실패했습니다.";

			if (
				message.includes("401") ||
				message.includes("로그인이 필요합니다")
			) {
				await openLoginPopup();
				return;
			}

			toast.show(message);
		} finally {
			submitting = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Enter" && !e.shiftKey) {
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
		<button
			onclick={() => goto("/")}
			class="p-2 text-white"
			aria-label="뒤로가기"
		>
			<ChevronLeft size={24} />
		</button>
		<span class="text-base font-medium text-white">메생결산 톡</span>
	</header>

	<!-- Comment Count -->
	<div class="flex items-center bg-white px-6 py-5">
		<div class="flex items-center gap-1">
			<span class="text-base text-text-primary">톡</span>
			<span class="text-base text-primary-dark"
				>{comments.length.toLocaleString()}</span
			>
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
					<CommentItem
						{comment}
						onDelete={(id) => {
							comments = comments.filter((c) => c.id !== id);
						}}
					/>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Input Area -->
	<div class="flex items-end gap-4 bg-white px-6 py-2 border-t border-border">
		{#if !$authStore.isAuthenticated}
			<!-- Logged out UI -->
			<button
				onclick={openLoginPopup}
				class="w-full py-3 bg-[#F87C56] text-white font-medium rounded-xl text-center active:opacity-80 transition-opacity"
			>
				이름/학번 입력하고 톡 등록하기 &rarr;
			</button>
		{:else}
			<!-- Logged in UI -->
			<div class="flex items-end grow bg-[#EDF1F5] rounded-3xl px-4 py-2">
				<textarea
					bind:this={textareaEl}
					bind:value={inputText}
					oninput={adjustTextarea}
					onkeydown={handleKeydown}
					placeholder="톡을 남겨 보세요."
					rows={1}
					class="w-full bg-transparent text-base text-text-primary placeholder-text-muted outline-none resize-none leading-6"
					style="overflow-y: hidden;"
				></textarea>
			</div>
			<button
				onclick={submitComment}
				disabled={submitting}
				class="w-10 h-10 flex items-center justify-center rounded-full shrink-0 bg-[#F87C56] text-[#FFFFFF] active:opacity-80 transition-opacity disabled:opacity-50"
				aria-label="톡 보내기"
			>
				{#if submitting}
					<span class="text-xs">...</span>
				{:else}
					<Send size={20} />
				{/if}
			</button>
		{/if}
	</div>

	<!-- Login Bottom Sheet Modal -->
	{#if showLoginBottomSheet}
		<BottomSheetLogin
			onClose={closeLoginPopup}
			onSuccess={handleLoginSuccess}
		/>
	{/if}
</div>
