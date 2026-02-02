<script lang="ts">
	import type { Character } from '$lib/types';

	interface Props {
		character: Character;
	}

	let { character }: Props = $props();
</script>

<a
	href="/member/{character.id}"
	class="flex flex-col bg-white rounded-lg px-3 py-2 hover:shadow-md transition-shadow"
>
	<!-- Badge area -->
	<div class="size-3 bg-bg-light rounded-full self-start"></div>

	<!-- Avatar -->
	<div class="flex justify-center items-center py-2">
		<img
			src={character.avatarUrl}
			alt={character.name}
			class="w-3/4 aspect-[5/6] object-cover"
		/>
	</div>

	<!-- Info -->
	<div class="flex flex-col">
		<span class="text-sm text-text-primary leading-tight">{character.name}</span>
		<span class="text-xs text-primary-dark leading-tight">{character.nickname}</span>
	</div>
</a>
