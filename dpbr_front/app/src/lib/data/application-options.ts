export const GENDERS = [
	{ label: '남자', value: 'MALE' },
	{ label: '여자', value: 'FEMALE' }
] as const;

export const ACADEMIC_STATUS = [
	{ label: '재학생', value: 'UNDERGRAD' },
	{ label: '대학원생', value: 'GRADUATE' },
	{ label: '휴학생(일반)', value: 'LEAVE_GENERAL' },
	{ label: '휴학생(군)', value: 'LEAVE_MILITARY' },
	{ label: '졸업생', value: 'ALUMNI' },
	{ label: '교직원', value: 'STAFF' }
] as const;

export const OPENING_PARTY = [
	{ label: '참석', value: 'ATTEND' },
	{ label: '불참', value: 'ABSENT' },
	{ label: '일정 되면 참석', value: 'FLEXIBLE' }
] as const;

export const INTERVIEW_DATES = [
	{ label: '9월 13일 토요일', value: 'SAT_0913' },
	{ label: '9월 14일 일요일', value: 'SUN_0914' },
	{ label: '기타', value: 'OTHER' }
] as const;

export const MILITARY_MEMBER_OPTIONS = [
	{ label: '신청합니다', value: 'APPLY' },
	{ label: '신청하지 않습니다', value: 'NOT_APPLY' },
	{ label: '대상에 해당되지 않습니다', value: 'NOT_APPLICABLE' }
] as const;
