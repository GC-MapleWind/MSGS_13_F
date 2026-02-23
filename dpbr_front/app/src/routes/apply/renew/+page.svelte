<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
	import { submitRenewApplication, getDepartments, getJobs, getWorlds } from '$lib/utils/api';
	import {
		ACADEMIC_STATUS,
		GENDERS,
		MILITARY_MEMBER_OPTIONS,
		OPENING_PARTY
	} from '$lib/data/application-options';
	import type { RenewApplicationPayload } from '$lib/types';

	const currentTerm = env.PUBLIC_APPLICATION_CURRENT_TERM || '2025-2';

	let form: RenewApplicationPayload = {
		term: currentTerm,
		name: '',
		student_id: '',
		department: '',
		phone_number: '',
		gender: 'MALE',
		academic_status: 'UNDERGRAD',
		nickname: '',
		job: '',
		world: '',
		level: 200,
		union_level: 0,
		rule_agreed: false,
		opening_party_intent: 'FLEXIBLE',
		military_member_option: 'NOT_APPLICABLE',
		free_chat_participation: true,
		alliance_chat_participation: true,
		fee_notice_ack: false,
		reason_for_reregistration: '',
		desired_event_style: '',
		suggestions: ''
	};

	let departments = $state<string[]>([]);
	let jobs = $state<string[]>([]);
	let worlds = $state<string[]>([]);
	let message = $state('');
	let loading = $state(false);
	let successMessage = $state('');

	onMount(async () => {
		const [depRes, jobRes, worldRes] = await Promise.all([getDepartments(), getJobs(), getWorlds()]);
		if (depRes.success && depRes.data) departments = depRes.data;
		if (jobRes.success && jobRes.data) jobs = jobRes.data;
		if (worldRes.success && worldRes.data) worlds = worldRes.data;
	});

	function normalizeStudentId(v: string) {
		return v.replace(/\D/g, '').slice(0, 9);
	}

	function normalizePhone(v: string) {
		return v.replace(/\D/g, '').slice(0, 11);
	}

	async function handleSubmit() {
		message = '';
		successMessage = '';
		if (!/^\d{9}$/.test(form.student_id)) {
			message = '학번은 9자리 숫자여야 합니다.';
			return;
		}
		if (!/^01\d{8,9}$/.test(form.phone_number)) {
			message = '전화번호 형식이 올바르지 않습니다.';
			return;
		}

		loading = true;
		const response = await submitRenewApplication(form as unknown as Record<string, unknown>);
		loading = false;
		if (!response.success) {
			message = response.message || '제출 실패';
			return;
		}
		successMessage = '재등록 신청이 완료되었습니다. 내 신청 내역으로 이동합니다.';
		await goto('/my/application');
	}
</script>

<div class="h-full overflow-y-auto bg-primary p-4 text-white">
	<h1 class="text-xl font-bold mb-2">재등록 신청서</h1>
	<p class="text-sm text-white/80 mb-4">기존 회원 정보를 확인한 뒤 제출해 주세요.</p>
	<div class="grid grid-cols-1 gap-2">
		<input class="p-2 rounded text-black" placeholder="이름" bind:value={form.name} />
		<select class="p-2 rounded text-black" bind:value={form.gender}>
			{#each GENDERS as item}<option value={item.value}>{item.label}</option>{/each}
		</select>
		<input class="p-2 rounded text-black" list="department-list" placeholder="학과" bind:value={form.department} />
		<datalist id="department-list">{#each departments as d}<option value={d}></option>{/each}</datalist>
		<input class="p-2 rounded text-black" placeholder="학번(9자리)" value={form.student_id} oninput={(e) => (form.student_id = normalizeStudentId((e.target as HTMLInputElement).value))} />
		<input class="p-2 rounded text-black" placeholder="전화번호(숫자만)" value={form.phone_number} oninput={(e) => (form.phone_number = normalizePhone((e.target as HTMLInputElement).value))} />
		<select class="p-2 rounded text-black" bind:value={form.academic_status}>
			{#each ACADEMIC_STATUS as item}<option value={item.value}>{item.label}</option>{/each}
		</select>
		<input class="p-2 rounded text-black" placeholder="닉네임" bind:value={form.nickname} />
		<select class="p-2 rounded text-black" bind:value={form.job}>
			<option value="">직업 선택</option>
			{#each jobs as j}<option value={j}>{j}</option>{/each}
		</select>
		<select class="p-2 rounded text-black" bind:value={form.world}>
			<option value="">월드 선택</option>
			{#each worlds as w}<option value={w}>{w}</option>{/each}
		</select>
		<input class="p-2 rounded text-black" type="number" min="1" max="400" placeholder="레벨" bind:value={form.level} />
		<input class="p-2 rounded text-black" type="number" min="0" max="20000" placeholder="유니온" bind:value={form.union_level} />
		<select class="p-2 rounded text-black" bind:value={form.military_member_option}>
			{#each MILITARY_MEMBER_OPTIONS as item}<option value={item.value}>{item.label}</option>{/each}
		</select>
		<select class="p-2 rounded text-black" bind:value={form.opening_party_intent}>
			{#each OPENING_PARTY as item}<option value={item.value}>{item.label}</option>{/each}
		</select>
		<label><input type="checkbox" bind:checked={form.free_chat_participation} /> 자유톡방 참여</label>
		<label><input type="checkbox" bind:checked={form.alliance_chat_participation} /> 연합톡방 참여</label>
		<label><input type="checkbox" bind:checked={form.fee_notice_ack} /> 회비 납부 안내 확인</label>
		<label><input type="checkbox" bind:checked={form.rule_agreed} /> 회칙 동의</label>
		<textarea class="p-2 rounded text-black" placeholder="재등록 이유" bind:value={form.reason_for_reregistration}></textarea>
		<textarea class="p-2 rounded text-black" placeholder="원하는 행사 스타일(선택)" bind:value={form.desired_event_style}></textarea>
		<textarea class="p-2 rounded text-black" placeholder="불편사항/건의사항" bind:value={form.suggestions}></textarea>
		<button class="bg-white text-primary-dark rounded p-3 font-semibold" onclick={handleSubmit} disabled={loading}>
			{loading ? '제출 중...' : '제출'}
		</button>
		{#if message}<p class="text-red-200 text-sm">{message}</p>{/if}
		{#if successMessage}<p class="text-green-200 text-sm">{successMessage}</p>{/if}
	</div>
</div>
