export interface Character {
	id: string;
	name: string;
	nickname: string;
	avatarUrl: string;
	level: number;
	job: string;
	club: string;
	server: string;
}

export interface SettlementItem {
	id: string;
	characterId: string;
	title: string;
	description: string;
	imageUrl: string;
	acquiredAt: string;
}

export interface TalkComment {
	id: string;
	author: string;
	authorAvatar: string;
	content: string;
	createdAt: string;
}
