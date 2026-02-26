<script lang="ts">
	import type { Character } from "$lib/types";
	import { handleImageError } from "$lib/utils/image";

	interface Props {
		character: Character;
	}

	let { character }: Props = $props();

	// 서버명 매핑 (world name to english logo filename)
	const worldLogoMap: Record<string, string> = {
		오로라: "aurora",
		레드: "red",
		이노시스: "enosis",
		유니온: "union",
		스카니아: "scania",
		루나: "luna",
		제니스: "zenith",
		크로아: "croa",
		베라: "bera",
		엘리시움: "elysium",
		아케인: "arcane",
		노바: "nova",
		// 일반/리부트 아닌 특수 구별용 맵핑 추가
		리부트: "reboot",
		리부트2: "reboot2",
		버닝: "burning",
		에오스: "eos",
		헬리오스: "helios",
		챌린저스: "challengers",
	};

	function getWorldLogoPath(serverName: string): string {
		const englishName = worldLogoMap[serverName];
		if (!englishName) return ""; // 매핑되지 않은 서버는 빈칸 유지 (fallback)
		return `/images/worlds/${englishName}.png`;
	}

	let logoPath = $derived(getWorldLogoPath(character.server));
</script>

<a
	href="/member/{character.id}"
	class="flex flex-col bg-white rounded-lg px-3 py-2 hover:shadow-md transition-shadow"
>
	<!-- Badge area (World Logo) -->
	<div class="h-4 flex items-center mb-1">
		{#if logoPath}
			<img
				src={logoPath}
				alt={character.server}
				class="h-full object-contain"
				onerror={(e) => {
					// 이미지 로드 실패시 요소 안보이게 처리
					(e.target as HTMLImageElement).style.display = "none";
				}}
			/>
		{:else}
			<span class="text-[10px] text-text-muted bg-bg-light px-1 rounded"
				>{character.server}</span
			>
		{/if}
	</div>

	<!-- Avatar -->
	<div class="flex justify-center items-center py-2">
		<img
			src={character.avatarUrl}
			alt={character.name}
			onerror={handleImageError}
			class="w-3/4 aspect-[5/6] object-cover"
		/>
	</div>

	<!-- Info -->
	<div class="flex flex-col">
		<span class="text-sm text-text-primary leading-tight"
			>{character.name}</span
		>
		<span class="text-xs text-primary-dark leading-tight"
			>{character.nickname}</span
		>
	</div>
</a>
