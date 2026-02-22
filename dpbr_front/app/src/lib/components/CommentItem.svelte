<script lang="ts">
	import type { TalkComment } from "$lib/types";
	import { authStore } from "$lib/stores/auth";
	import { deleteComment } from "$lib/api";
	import ConfirmPopup from "$lib/components/ConfirmPopup.svelte";
	import { toast } from "$lib/stores/toast";

	interface Props {
		comment: TalkComment;
		onDelete?: (id: string) => void;
	}

	let { comment, onDelete }: Props = $props();
	let isDeleting = $state(false);
	let showDeletePopup = $state(false);

	function handleDeleteClick() {
		showDeletePopup = true;
	}

	function handleCancelDelete() {
		showDeletePopup = false;
	}

	async function handleConfirmDelete() {
		showDeletePopup = false;
		isDeleting = true;
		try {
			await deleteComment(comment.id);
			if (onDelete) {
				onDelete(comment.id);
			}
		} catch (e) {
			const message =
				e instanceof Error ? e.message : "삭제에 실패했습니다.";
			toast.show(message);
		} finally {
			isDeleting = false;
		}
	}
</script>

<div
	class="flex flex-col gap-2 px-6 pt-4 bg-white transition-opacity {isDeleting
		? 'opacity-50'
		: ''}"
>
	<div class="flex justify-between items-center">
		<div class="flex items-center gap-2">
			<span class="text-xs font-light text-text-primary"
				>{comment.author}</span
			>
		</div>
		{#if $authStore.isAuthenticated && $authStore.user?.id?.toString() === comment.userId}
			<button
				onclick={handleDeleteClick}
				disabled={isDeleting}
				class="text-xs font-light text-text-muted transition-colors hover:text-red-500 hover:underline disabled:opacity-50"
				aria-label="톡 삭제"
			>
				삭제
			</button>
		{/if}
	</div>
	<div class="pb-4 border-b border-border flex flex-col gap-1">
		<p class="text-sm font-light text-text-primary">{comment.content}</p>
		<span class="text-xs font-light text-text-muted text-left"
			>{comment.createdAt}</span
		>
	</div>
</div>

{#if showDeletePopup}
	<ConfirmPopup
		title="톡을 삭제하시겠습니까?"
		cancelText="뒤로가기"
		confirmText="삭제하기"
		onConfirm={handleConfirmDelete}
		onCancel={handleCancelDelete}
	/>
{/if}
