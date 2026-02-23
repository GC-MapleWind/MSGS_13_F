<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import { env } from '$env/dynamic/public';

	const currentTerm = env.PUBLIC_APPLICATION_CURRENT_TERM || '2025-2';
</script>

<svelte:head>
	<title>신청 유형 선택 - 단풍바람</title>
</svelte:head>

<div class="h-full bg-primary p-6 text-white flex flex-col gap-5 justify-center">
	<h1 class="text-2xl font-bold">{currentTerm} 단풍바람 신청</h1>
	<p class="text-white/85 text-sm">신청 유형을 선택한 뒤 폼을 제출해 주세요.</p>

	<div class="bg-white/10 rounded-xl p-4">
		<p class="text-sm leading-6">• 학번은 9자리 숫자로 입력해 주세요.</p>
		<p class="text-sm leading-6">• 전화번호는 숫자만 입력해 주세요.</p>
		<p class="text-sm leading-6">• 제출 후 내 신청 내역에서 확인할 수 있습니다.</p>
	</div>

	<div class="space-y-3">
		<Button
			label="신입 신청"
			variant="primary"
			onClick={() => goto('/apply/new')}
			class="text-left"
		/>
		<Button
			label="재등록 신청"
			variant="primary"
			onClick={() => goto('/apply/renew')}
			class="text-left"
		/>
	</div>
</div>
