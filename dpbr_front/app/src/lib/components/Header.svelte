<script lang="ts">
	import { Menu, MessageCircle, ChevronLeft, X, Download } from 'lucide-svelte';

	interface Props {
		variant?: 'main' | 'detail' | 'close' | 'save';
		title?: string;
		subtitle?: string;
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
				class="shrink-0 flex items-center justify-center h-10 px-4 rounded-2xl border border-border-dark text-sm text-text-secondary"
			>
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
