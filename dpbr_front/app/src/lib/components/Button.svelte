<script lang="ts">
	interface Props {
		label: string;
		variant?: "primary" | "secondary";
		buttonState?: "default" | "focused" | "disabled";
		onClick: () => void;
		type?: "button" | "submit";
		class?: string;
	}

	let {
		label,
		variant = "primary",
		buttonState = "default",
		onClick,
		type = "button",
		class: className = "",
	}: Props = $props();

	let isPressed = $state(false);

	function handleMouseDown() {
		isPressed = true;
	}

	function handleMouseUp() {
		isPressed = false;
	}

	function handleClick() {
		if (buttonState !== "disabled") {
			onClick();
		}
	}
</script>

<button
	{type}
	onclick={handleClick}
	onmousedown={handleMouseDown}
	onmouseup={handleMouseUp}
	onmouseleave={handleMouseUp}
	disabled={buttonState === "disabled"}
	class="w-full py-3 px-4 rounded-lg font-medium text-base relative
		{variant === 'primary' ? 'bg-white text-text-primary' : 'bg-primary text-white'}
		{buttonState === 'disabled'
		? 'opacity-50 cursor-not-allowed'
		: 'cursor-pointer'} {className}"
	aria-label={label}
>
	<span class="relative z-10">{label}</span>
	<div
		class="absolute inset-0 bg-black/4 rounded-lg transition-opacity duration-100"
		class:opacity-100={isPressed || buttonState === "focused"}
		class:opacity-0={!isPressed && buttonState !== "focused"}
	></div>
</button>
