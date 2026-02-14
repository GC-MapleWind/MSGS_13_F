<script lang="ts">
	import { Menu, MessageCircle, ChevronLeft, X, Download } from 'lucide-svelte';

	interface Props {
		variant?: 'main' | 'detail' | 'close' | 'save';
		title?: string;
		subtitle?: string;
		isSaving?: boolean;
		onMenuClick?: () => void;
		onBackClick?: () => void;
		onCloseClick?: () => void;
		onTalkClick?: () => void;
		onSaveClick?: () => void;
	}

	let {
		variant = 'main',
		title = '',
		subtitle = '',
		isSaving = false,
		onMenuClick,
		onBackClick,
		onCloseClick,
		onTalkClick,
		onSaveClick
	}: Props = $props();
</script>

{#if variant === 'main'}
	<header class="flex items-center justify-between bg-primary px-3 py-2 sticky top-0 z-30">
		<button onclick={onMenuClick} class="p-2 text-white" aria-label="메뉴 열기">
			<Menu size={24} />
		</button>
		<span class="text-lg font-bold text-white">단풍바람</span>
		<a href="/talk" class="p-2 text-white" aria-label="톡 페이지">
			<MessageCircle size={24} />
		</a>
	</header>
{:else if variant === 'detail'}
	<header class="flex items-center gap-2 bg-white px-3 py-2 sticky top-0 z-30 border-b border-border">
		<button onclick={onBackClick} class="p-2 text-text-primary" aria-label="뒤로가기">
			<ChevronLeft size={24} />
		</button>
		<div class="flex flex-col grow min-w-0">
			{#if title}
				<span class="text-base font-medium text-text-primary truncate">{title}</span>
			{/if}
			{#if subtitle}
				<span class="text-xs text-text-muted">{subtitle}</span>
			{/if}
		</div>
		{#if onSaveClick}
			<button
				onclick={onSaveClick}
				disabled={isSaving}
				class="shrink-0 flex items-center justify-center gap-1.5 h-10 px-4 rounded-2xl border border-border-dark text-sm text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
				aria-label={isSaving ? '저장 중...' : '페이지 저장'}
			>
				{#if isSaving}
					<svg
						class="animate-spin h-4 w-4"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							class="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
				{:else}
					<Download size={16} />
				{/if}
				저장
			</button>
		{/if}
	</header>
{:else if variant === 'close'}
	<header class="flex items-center justify-end bg-white px-3 py-2 sticky top-0 z-30">
		<button onclick={onCloseClick} class="p-2 text-text-primary" aria-label="닫기">
			<X size={24} />
		</button>
	</header>
{:else if variant === 'save'}
	<header class="flex items-center justify-end bg-transparent px-3 py-2 sticky top-0 z-40">
		<button onclick={onCloseClick} class="p-2 text-white" aria-label="닫기">
			<X size={24} />
		</button>
	</header>
{/if}
