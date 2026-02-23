<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
	import { submitNewApplication, getDepartments, getJobs, getWorlds } from '$lib/utils/api';
	import {
		ACADEMIC_STATUS,
		GENDERS,
		INTERVIEW_DATES,
		OPENING_PARTY
	} from '$lib/data/application-options';
	import type { NewApplicationPayload } from '$lib/types';

	const currentTerm = env.PUBLIC_APPLICATION_CURRENT_TERM || '2025-2';

	let form: NewApplicationPayload = {
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
		interview_date_option: 'SAT_0913',
		student_card_confirmed: false,
		privacy_agreed: false
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
		const response = await submitNewApplication(form as unknown as Record<string, unknown>);
		loading = false;
		if (!response.success) {
			message = response.message || '제출 실패';
			return;
		}
		successMessage = '신입 신청이 완료되었습니다. 내 신청 내역으로 이동합니다.';
		await goto('/my/application');
	}
</script>

<div class="h-full overflow-y-auto bg-primary p-4 text-white">
	<h1 class="text-xl font-bold mb-2">신입 신청서</h1>
	<p class="text-sm text-white/80 mb-4">필수 항목을 모두 입력한 뒤 제출해 주세요.</p>
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
		<select class="p-2 rounded text-black" bind:value={form.interview_date_option}>
			{#each INTERVIEW_DATES as item}<option value={item.value}>{item.label}</option>{/each}
		</select>
		<select class="p-2 rounded text-black" bind:value={form.opening_party_intent}>
			{#each OPENING_PARTY as item}<option value={item.value}>{item.label}</option>{/each}
		</select>
		<label><input type="checkbox" bind:checked={form.student_card_confirmed} /> 학생증 제출 확인</label>
		<label><input type="checkbox" bind:checked={form.rule_agreed} /> 회칙 동의</label>
		<label><input type="checkbox" bind:checked={form.privacy_agreed} /> 개인정보 동의</label>
		<button class="bg-white text-primary-dark rounded p-3 font-semibold" onclick={handleSubmit} disabled={loading}>
			{loading ? '제출 중...' : '제출'}
		</button>
		{#if message}<p class="text-red-200 text-sm">{message}</p>{/if}
		{#if successMessage}<p class="text-green-200 text-sm">{successMessage}</p>{/if}
	</div>
</div>
