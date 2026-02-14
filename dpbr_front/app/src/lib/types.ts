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

export interface User {
	name: string;
	studentId: string;
}

export interface AuthState {
	isAuthenticated: boolean;
	user: User | null;
	isLoading: boolean;
	registerToken?: string | null; // 추가
}