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
	userId: string | null;  // 작성자의 고유 ID (비회원 등 null일 수 있음)
	author: string;
	authorAvatar: string;
	content: string;
	createdAt: string;
}

export interface User {
	id: number;           // 백엔드 회원 고유 번호
	name: string;
	studentId: string;
}

export interface AuthState {
	isAuthenticated: boolean;
	user: User | null;
	isLoading: boolean;
	registerToken?: string | null; // 추가
}