<script lang="ts">
	interface Props {
		variant?: "main" | "detail" | "close" | "save";
		title?: string;
		subtitle?: string;
		onMenuClick?: () => void;
		onBackClick?: () => void;
		onCloseClick?: () => void;
		onTalkClick?: () => void;
	}

	let {
		variant = "main",
		title = "",
		subtitle = "",
		onMenuClick,
		onBackClick,
		onCloseClick,
		onTalkClick,
	}: Props = $props();
</script>

{#if variant === "main"}
	<header
		class="flex items-center justify-between bg-transparent px-3 py-2 sticky top-0 z-30"
	>
		<button
			onclick={onMenuClick}
			class="p-2 text-white"
			aria-label="메뉴 열기"
		>
			<img
				src="/images/icons/name=Menu, Color=White.svg"
				alt="메뉴 열기"
				class="w-6 h-6"
				draggable="false"
			/>
		</button>
		<img
			src="/images/logos/logo-text-white.svg"
			alt="단풍바람"
			class="h-[18px] object-contain"
			draggable="false"
		/>
		<a href="/talk" class="p-2 text-white" aria-label="톡 페이지">
			<img
				src="/images/icons/name=Chat, Color=White.svg"
				alt="톡 페이지"
				class="w-6 h-6"
				draggable="false"
			/>
		</a>
	</header>
{:else if variant === "detail"}
	<header
		class="relative flex items-center bg-white px-2 py-3 sticky top-0 z-30 border-b border-gray-100"
	>
		<button
			onclick={onBackClick}
			class="p-2 text-text-primary shrink-0 relative z-10"
			aria-label="뒤로가기"
		>
			<img
				src="/images/icons/name=Back, Color=Black.svg"
				alt="뒤로가기"
				class="w-6 h-6 opacity-70"
				draggable="false"
			/>
		</button>
		<div
			class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-12"
		>
			{#if title}
				<span class="text-[17px] font-medium text-text-primary truncate"
					>{title}</span
				>
			{/if}
			{#if subtitle}
				<span class="text-xs text-text-muted">{subtitle}</span>
			{/if}
		</div>
	</header>
{:else if variant === "close"}
	<header
		class="flex items-center justify-end bg-white px-3 py-2 sticky top-0 z-30"
	>
		<button
			onclick={onCloseClick}
			class="p-2 text-text-primary"
			aria-label="닫기"
		>
			<img
				src="/images/icons/name=Close, Color=Black.svg"
				alt="닫기"
				class="w-6 h-6"
				draggable="false"
			/>
		</button>
	</header>
{:else if variant === "save"}
	<header
		class="flex items-center justify-end bg-transparent px-3 py-2 sticky top-0 z-40"
	>
		<button onclick={onCloseClick} class="p-2 text-white" aria-label="닫기">
			<img
				src="/images/icons/name=Close, Color=White.svg"
				alt="닫기"
				class="w-6 h-6"
				draggable="false"
			/>
		</button>
	</header>
{/if}
