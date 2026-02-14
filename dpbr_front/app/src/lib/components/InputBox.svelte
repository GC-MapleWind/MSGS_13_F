<script lang="ts">
	import { X } from "lucide-svelte";

	interface Props {
		type?: "text" | "number" | "tel";
		placeholder: string;
		value: string;
		maxLength?: number;
		inputState?: "default" | "focused";
		showClearButton?: boolean;
		onInput: (value: string) => void;
		onFocus?: () => void;
		onBlur?: () => void;
		onClear?: () => void;
		class?: string;
	}

	let {
		type = "text",
		placeholder,
		value: valueProp,
		maxLength,
		inputState = "default",
		showClearButton = false,
		onInput,
		onFocus,
		onBlur,
		onClear,
		class: className = "",
	}: Props = $props();

	let inputEl: HTMLInputElement | undefined = $state();
	let internalValue = $state(valueProp);

	// 외부 value prop 변경 시 내부 값 동기화
	$effect(() => {
		if (valueProp !== internalValue && inputEl?.value !== valueProp) {
			internalValue = valueProp;
			if (inputEl) {
				inputEl.value = valueProp;
			}
		}
	});

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		let newValue = target.value;

		// 최대 길이 제한
		if (maxLength && newValue.length > maxLength) {
			newValue = newValue.slice(0, maxLength);
			if (inputEl) {
				inputEl.value = newValue;
			}
		}

		internalValue = newValue;
		onInput(newValue);
	}

	function handleClear() {
		if (inputEl) {
			inputEl.value = "";
			onInput("");
		}
		onClear?.();
	}
</script>

<div class="relative">
	<input
		bind:this={inputEl}
		{type}
		{placeholder}
		value={internalValue}
		oninput={handleInput}
		onfocus={onFocus}
		onblur={onBlur}
		class="w-full px-4 py-3 rounded-lg bg-primary text-white placeholder-white/70 outline-none transition-all
			{inputState === 'focused' ? 'ring-2 ring-white/50' : ''} {className}"
		style="max-length: {maxLength || 'none'};"
		aria-label={placeholder}
	/>
	{#if showClearButton && internalValue.length > 0}
		<button
			type="button"
			onclick={handleClear}
			class="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-300/80 flex items-center justify-center hover:bg-gray-400/80 transition-colors"
			aria-label="입력 내용 삭제"
		>
			<X size={14} class="text-gray-700" />
		</button>
	{/if}
</div>
