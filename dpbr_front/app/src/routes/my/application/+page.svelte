<script lang="ts">
	import { onMount } from 'svelte';
	import { getMyApplication } from '$lib/utils/api';
	import type { ApplicationSummary } from '$lib/types';

	let loading = $state(true);
	let error = $state('');
	let member: Record<string, string> | null = $state(null);
	let application: ApplicationSummary | null = $state(null);
	let newDetail: Record<string, unknown> | null = $state(null);
	let renewDetail: Record<string, unknown> | null = $state(null);

	onMount(async () => {
		const response = await getMyApplication();
		if (!response.success || !response.data) {
			error = response.message || '신청 내역이 없습니다.';
			loading = false;
			return;
		}

		const payload = response.data as {
			member: Record<string, string>;
			application: ApplicationSummary;
			new_detail?: Record<string, unknown>;
			renew_detail?: Record<string, unknown>;
		};
		member = payload.member;
		application = payload.application;
		newDetail = payload.new_detail || null;
		renewDetail = payload.renew_detail || null;
		loading = false;
	});
</script>

<div class="h-full overflow-y-auto bg-primary p-4 text-white">
	<h1 class="text-xl font-bold mb-4">내 신청 내역</h1>
	{#if loading}
		<p>불러오는 중...</p>
	{:else if error}
		<p class="text-red-200">{error}</p>
	{:else if application && member}
		<div class="bg-white/10 rounded-lg p-4 space-y-2">
			<p><b>신청 유형:</b> {application.application_type === 'NEW' ? '신입' : '재등록'}</p>
			<p><b>상태:</b> {application.status}</p>
			<p><b>학기:</b> {application.term}</p>
			<p><b>이름:</b> {member.name}</p>
			<p><b>학번:</b> {member.student_id}</p>
			<p><b>학과:</b> {member.department}</p>
			<p><b>닉네임:</b> {application.nickname}</p>
			<p><b>직업/월드:</b> {application.job} / {application.world}</p>
			<p><b>레벨/유니온:</b> {application.level} / {application.union_level}</p>
			{#if newDetail}
				<p><b>면접일:</b> {String(newDetail.interview_date_option || '-')}</p>
			{/if}
			{#if renewDetail}
				<p><b>재등록 사유:</b> {String(renewDetail.reason_for_reregistration || '-')}</p>
			{/if}
		</div>
	{/if}
</div>
