import type { Character, SettlementItem, TalkComment } from './types';

export const characters: Character[] = [
	{
		id: 'char-1',
		name: '강민아',
		nickname: '담뫄',
		avatarUrl: 'https://placehold.co/200x200/FFE0B2/ff8e42?text=DM',
		level: 265,
		job: '아크',
		club: '단풍바람',
		server: '이노시스'
	},
	{
		id: 'char-2',
		name: '이서준',
		nickname: '바람솔',
		avatarUrl: 'https://placehold.co/200x200/E8F5E9/4CAF50?text=BS',
		level: 280,
		job: '아델',
		club: '단풍바람',
		server: '스카니아'
	},
	{
		id: 'char-3',
		name: '박하늘',
		nickname: '하늘빛',
		avatarUrl: 'https://placehold.co/200x200/E3F2FD/2196F3?text=HB',
		level: 272,
		job: '카인',
		club: '단풍바람',
		server: '루나'
	},
	{
		id: 'char-4',
		name: '최유진',
		nickname: '별하나',
		avatarUrl: 'https://placehold.co/200x200/F3E5F5/9C27B0?text=BH',
		level: 258,
		job: '호영',
		club: '단풍바람',
		server: '크로아'
	},
	{
		id: 'char-5',
		name: '김단풍',
		nickname: '단풍잎',
		avatarUrl: 'https://placehold.co/200x200/FFF3E0/FF9800?text=DJ',
		level: 290,
		job: '라라',
		club: '단풍바람',
		server: '이노시스'
	},
	{
		id: 'char-6',
		name: '정수아',
		nickname: '수아링',
		avatarUrl: 'https://placehold.co/200x200/FCE4EC/E91E63?text=SA',
		level: 275,
		job: '칼리',
		club: '단풍바람',
		server: '엘리시움'
	},
	{
		id: 'char-7',
		name: '윤도현',
		nickname: '도현이',
		avatarUrl: 'https://placehold.co/200x200/E0F2F1/009688?text=DH',
		level: 268,
		job: '제로',
		club: '단풍바람',
		server: '스카니아'
	},
	{
		id: 'char-8',
		name: '한소희',
		nickname: '소히짱',
		avatarUrl: 'https://placehold.co/200x200/FFF9C4/FFC107?text=SH',
		level: 283,
		job: '키네시스',
		club: '단풍바람',
		server: '루나'
	},
	{
		id: 'char-9',
		name: '오태양',
		nickname: '태양빛',
		avatarUrl: 'https://placehold.co/200x200/FFCCBC/FF5722?text=TY',
		level: 277,
		job: '듀얼블레이드',
		club: '단풍바람',
		server: '이노시스'
	},
	{
		id: 'char-10',
		name: '윤성현',
		nickname: '성현이',
		avatarUrl: 'https://placehold.co/200x200/F8BBD0/C2185B?text=YH',
		level: 295,
		job: '비숍',
		club: '단풍바람',
		server: '스카니아'
	},
	{
		id: 'char-11',
		name: '최미나',
		nickname: '미나짱',
		avatarUrl: 'https://placehold.co/200x200/E1BEE7/7B1FA2?text=MN',
		level: 260,
		job: '윈드브레이커',
		club: '단풍바람',
		server: '루나'
	},
	{
		id: 'char-12',
		name: '강철수',
		nickname: '철수맨',
		avatarUrl: 'https://placehold.co/200x200/D1C4E9/512DA8?text=CS',
		level: 270,
		job: '다크나이트',
		club: '단풍바람',
		server: '엘리시움'
	},
	{
		id: 'char-13',
		name: '이영희',
		nickname: '영희공주',
		avatarUrl: 'https://placehold.co/200x200/C5CAE9/303F9F?text=YH',
		level: 268,
		job: '비스트테이머',
		club: '단풍바람',
		server: '크로아'
	},
	{
		id: 'char-14',
		name: '김민수',
		nickname: '민수형',
		avatarUrl: 'https://placehold.co/200x200/BBDEFB/1976D2?text=MS',
		level: 285,
		job: '나이트로드',
		club: '단풍바람',
		server: '베라'
	}
];

export const settlementItems: SettlementItem[] = [
	{
		id: 'msg-1',
		characterId: 'char-1',
		title: '메생결산 내용(제목으로 사용)',
		description:
			'길드원들과 함께한 보스레이드 최초 클리어! 모두가 힘을 합쳐 드디어 데미안을 처치했습니다. 정말 감격스러운 순간이었어요.',
		imageUrl: 'https://placehold.co/400x300/FFE0B2/ff8e42?text=BOSS+CLEAR',
		acquiredAt: '2026-08-30'
	},
	{
		id: 'msg-2',
		characterId: 'char-1',
		title: '길어도 두 줄로 안 내려가요',
		description:
			'레벨 265 달성 기념! 오랜 시간 동안 노력한 결과가 드디어 결실을 맺었습니다.',
		imageUrl: 'https://placehold.co/400x300/E8F5E9/4CAF50?text=LV+265',
		acquiredAt: '2026-08-29'
	},
	{
		id: 'msg-3',
		characterId: 'char-1',
		title: '내용이 길면 말줄임표 표시해 주세요 이렇게 길어지면 잘립니다',
		description:
			'단풍바람 길드 창립 1주년을 맞이하여 특별 이벤트를 진행했습니다. 모든 길드원이 참여하여 즐거운 시간을 보냈어요.',
		imageUrl: 'https://placehold.co/400x300/E3F2FD/2196F3?text=1ST+ANNIVERSARY',
		acquiredAt: '2026-08-28'
	},
	{
		id: 'msg-4',
		characterId: 'char-1',
		title: '길면 말줄임표 표시해 주세용',
		description: '첫 번째 무릉도장 100층 달성! 꾸준한 연습의 결과입니다.',
		imageUrl: 'https://placehold.co/400x300/F3E5F5/9C27B0?text=MULUNG+100',
		acquiredAt: '2026-08-27'
	},
	{
		id: 'msg-5',
		characterId: 'char-1',
		title: '살다살다 데미안도 잡아보네 내가 이걸 해내다니',
		description:
			'살다살다 데미안도 잡아보네 내용이 길면 두 줄로 내려갑니다(반응형 textbox입니다). 정말 오래 걸렸지만 결국 해냈어요!',
		imageUrl: 'https://placehold.co/400x300/FFCCBC/FF5722?text=DEMIAN',
		acquiredAt: '2026-08-01'
	},
	{
		id: 'msg-6',
		characterId: 'char-1',
		title: '유니온 8000 달성! 전투력 상승',
		description: '드디어 유니온 8000을 찍었습니다. 매일매일 조금씩 키우던 부캐들이 모여 큰 힘이 되었네요.',
		imageUrl: 'https://placehold.co/400x300/E1BEE7/8E24AA?text=UNION+8000',
		acquiredAt: '2026-07-15'
	},
	{
		id: 'msg-7',
		characterId: 'char-1',
		title: '마라벨 1기 풀세트 완성',
		description: '꿈에 그리던 마스터 라벨 1기 풀세트를 완성했습니다. 코디의 완성은 역시 마라벨!',
		imageUrl: 'https://placehold.co/400x300/BBDEFB/1976D2?text=MASTER+LABEL',
		acquiredAt: '2026-06-20'
	},
	{
		id: 'msg-8',
		characterId: 'char-1',
		title: '제네시스 무기 해방 퀘스트 완료',
		description: '검은 마법사를 격파하고 드디어 제네시스 무기를 해방했습니다. 이제 진정한 해방 유저!',
		imageUrl: 'https://placehold.co/400x300/FFCDD2/D32F2F?text=GENESIS+WEAPON',
		acquiredAt: '2026-05-10'
	},
	{
		id: 'msg-9',
		characterId: 'char-1',
		title: '시드 링 4레벨 획득 (리레4)',
		description: '더 시드 50층 등반 보상으로 리스트레인트 링 4레벨이 떴습니다! 믿기지 않는 행운이네요.',
		imageUrl: 'https://placehold.co/400x300/C8E6C9/388E3C?text=ROR+4',
		acquiredAt: '2026-04-05'
	},
	{
		id: 'msg-10',
		characterId: 'char-1',
		title: '몬스터 컬렉션 1000마리 등록',
		description: '메이플 월드를 누비며 몬스터 컬렉션 1000마리를 등록했습니다. 탐험의 증표!',
		imageUrl: 'https://placehold.co/400x300/FFECB3/FFA000?text=MONSTER+COL',
		acquiredAt: '2026-03-22'
	}
];

export const talkComments: TalkComment[] = [
	{
		id: 'talk-1',
		userId: '101',
		author: '단풍사랑',
		authorAvatar: 'https://placehold.co/40x40/FFE0B2/ff8e42?text=DS',
		content: '안녕하세요! 단풍바람 13기 메생결산 축하합니다!',
		createdAt: '26. 01. 22. 23:11'
	},
	{
		id: 'talk-2',
		userId: '102',
		author: '메이플러버',
		authorAvatar: 'https://placehold.co/40x40/E8F5E9/4CAF50?text=ML',
		content: '모두 수고하셨습니다~ 다음 기수도 화이팅!',
		createdAt: '26. 01. 22. 22:45'
	},
	{
		id: 'talk-3',
		userId: '103',
		author: '바람의나라',
		authorAvatar: 'https://placehold.co/40x40/E3F2FD/2196F3?text=BN',
		content: '메생결산 정말 잘 만들었네요. 디자인이 너무 예뻐요!',
		createdAt: '26. 01. 22. 21:30'
	},
	{
		id: 'talk-4',
		userId: '104',
		author: '길드장최고',
		authorAvatar: 'https://placehold.co/40x40/F3E5F5/9C27B0?text=GJ',
		content:
			'우리 길드원들 최고! 다 같이 힘내서 이번 시즌도 잘 마무리합시다. 앞으로도 함께 즐거운 메이플 생활 해요~',
		createdAt: '26. 01. 21. 18:20'
	},
	{
		id: 'talk-5',
		userId: '105',
		author: '초보모험가',
		authorAvatar: 'https://placehold.co/40x40/FFF9C4/FFC107?text=CB',
		content: '저도 다음에 메생결산 받고 싶어요!',
		createdAt: '26. 01. 21. 15:05'
	},
	{
		id: 'talk-6',
		userId: '106',
		author: '어둠의기사',
		authorAvatar: 'https://placehold.co/40x40/FFCCBC/FF5722?text=DK',
		content: '멋진 결산이네요 ㅎㅎ',
		createdAt: '26. 01. 20. 09:33'
	},
	{
		id: 'talk-7',
		userId: '107',
		author: '별빛수호자',
		authorAvatar: 'https://placehold.co/40x40/FCE4EC/E91E63?text=BS',
		content: '와 진짜 대단하다... 부럽!',
		createdAt: '26. 01. 19. 20:12'
	},
	{
		id: 'talk-8',
		userId: '108',
		author: '나무늘보',
		authorAvatar: 'https://placehold.co/40x40/E0F2F1/009688?text=NB',
		content: '다음 기수에는 저도 꼭 참여할게요!',
		createdAt: '26. 01. 19. 14:40'
	}
];

export function getCharacterById(id: string): Character | undefined {
	return characters.find((c) => c.id === id);
}

export function getSettlementsByCharacterId(characterId: string): SettlementItem[] {
	return settlementItems.filter((s) => s.characterId === characterId);
}

export function getSettlementById(id: string): SettlementItem | undefined {
	return settlementItems.find((s) => s.id === id);
}
