import type { Character, SettlementItem, TalkComment } from './types';

export const STATIC_CHARACTERS: Character[] = [
	{
		id: '2',
		name: '강민아',
		nickname: '담뫄',
		avatarUrl: '/default-avatar.png',
		level: 263,
		job: '아크',
		club: '단풍바람',
		server: '이노시스'
	},
	{
		id: '40',
		name: '배승민',
		nickname: '아기요우무',
		avatarUrl: '/default-avatar.png',
		level: 280,
		job: '렌',
		club: '단풍바람',
		server: '스카니아'
	},
	{
		id: '1',
		name: '강민',
		nickname: '마가다락방',
		avatarUrl: '/default-avatar.png',
		level: 285,
		job: '제로',
		club: '단풍바람',
		server: '에오스'
	}
];

export const STATIC_SETTLEMENTS: SettlementItem[] = [
	{
		id: 'msg-2-1',
		characterId: '2',
		title: '강민아 메생결산',
		description: '이번 학기 주간 보스 파티를 안정적으로 운영하고, 길드 활동 참여율을 크게 올렸습니다.',
		imageUrl: '/logo.png',
		acquiredAt: '2026-02-20'
	},
	{
		id: 'msg-2-2',
		characterId: '2',
		title: '아크 숙련도 성장',
		description: '직업 이해도를 높여 주요 패턴 대응 능력을 개선했습니다.',
		imageUrl: '/logo.png',
		acquiredAt: '2026-01-30'
	},
	{
		id: 'msg-40-1',
		characterId: '40',
		title: '배승민 메생결산',
		description: '길드 레이드에서 핵심 포지션을 맡아 안정적인 클리어를 지원했습니다.',
		imageUrl: '/logo.png',
		acquiredAt: '2026-02-18'
	},
	{
		id: 'msg-40-2',
		characterId: '40',
		title: '렌 전투 운용 개선',
		description: '유틸 운용과 생존 동선을 정교하게 다듬어 파티 기여도가 상승했습니다.',
		imageUrl: '/logo.png',
		acquiredAt: '2026-01-28'
	},
	{
		id: 'msg-1-1',
		characterId: '1',
		title: '강민 메생결산',
		description: '장비 세팅 최적화와 컨텐츠 루틴 정리를 통해 성장 속도를 안정화했습니다.',
		imageUrl: '/logo.png',
		acquiredAt: '2026-02-15'
	},
	{
		id: 'msg-1-2',
		characterId: '1',
		title: '제로 운용 고도화',
		description: '보스전 운영 템포를 개선해 장기전에서의 안정성이 향상되었습니다.',
		imageUrl: '/logo.png',
		acquiredAt: '2026-01-25'
	}
];

export const STATIC_COMMENTS: TalkComment[] = [
	{
		id: 'talk-1',
		userId: 2,
		author: '강민아',
		authorAvatar: '/default-avatar.png',
		content: '이번 기수 모두 고생 많았어요!',
		createdAt: '26. 02. 22. 20:10'
	},
	{
		id: 'talk-2',
		userId: 40,
		author: '배승민',
		authorAvatar: '/default-avatar.png',
		content: '다음 시즌도 같이 재밌게 해봐요.',
		createdAt: '26. 02. 21. 19:40'
	},
	{
		id: 'talk-3',
		userId: 1,
		author: '강민',
		authorAvatar: '/default-avatar.png',
		content: '정적 페이지 버전도 깔끔하게 정리됐네요.',
		createdAt: '26. 02. 20. 17:05'
	}
];
