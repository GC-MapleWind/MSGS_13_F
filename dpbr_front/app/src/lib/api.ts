import type { Character, SettlementItem, TalkComment, TeamMessageItem } from './types';
import { STATIC_CHARACTERS, STATIC_COMMENTS, STATIC_SETTLEMENTS } from './static-data';

interface CommentResponse {
	id: number;
	user_id: number | null;
	author: string;
	content: string;
	created_at: string;
}

const commentsState: TalkComment[] = [...STATIC_COMMENTS];

function getAccessToken(): string | null {
	if (typeof window === 'undefined') return null;
	try {
		return localStorage.getItem('auth_token');
	} catch {
		return null;
	}
}

function getAuthUserName(): string {
	if (typeof window === 'undefined') return '강민';
	try {
		const stored = localStorage.getItem('auth_user');
		if (!stored) return '강민';
		const parsed = JSON.parse(stored) as { name?: string };
		if (parsed.name === '강민아' || parsed.name === '배승민' || parsed.name === '강민') {
			return parsed.name;
		}
		return '강민';
	} catch {
		return '강민';
	}
}

function toCommentResponse(comment: TalkComment): CommentResponse {
	return {
		id: Number(comment.id.replace(/\D+/g, '')) || Date.now(),
		user_id: comment.userId,
		author: comment.author,
		content: comment.content,
		created_at: new Date().toISOString()
	};
}

export async function getCharacters(): Promise<Character[]> {
	return [...STATIC_CHARACTERS];
}

export async function getCharactersPaginated(
	page: number = 1,
	limit: number = 10
): Promise<{ items: Character[]; total: number; page: number; limit: number }> {
	const start = Math.max(0, (page - 1) * limit);
	const items = STATIC_CHARACTERS.slice(start, start + limit);

	return {
		items,
		total: STATIC_CHARACTERS.length,
		page,
		limit
	};
}

export async function getCharacterById(id: string): Promise<Character | null> {
	return STATIC_CHARACTERS.find((char) => char.id === id) ?? null;
}

export async function getSettlementsByCharacterId(characterId: string): Promise<SettlementItem[]> {
	return STATIC_SETTLEMENTS.filter((settlement) => settlement.characterId === characterId);
}

export async function getSettlementsByCharacterIdPaginated(
	characterId: string,
	page: number = 1,
	limit: number = 10
): Promise<{ items: SettlementItem[]; total: number; page: number; limit: number }> {
	const items = STATIC_SETTLEMENTS.filter((settlement) => settlement.characterId === characterId);
	const start = Math.max(0, (page - 1) * limit);

	return {
		items: items.slice(start, start + limit),
		total: items.length,
		page,
		limit
	};
}

export async function getSettlementById(id: string): Promise<SettlementItem | null> {
	return STATIC_SETTLEMENTS.find((settlement) => settlement.id === id) ?? null;
}

export async function getComments(page: number = 1, limit: number = 20): Promise<TalkComment[]> {
	const start = Math.max(0, (page - 1) * limit);
	return commentsState.slice(start, start + limit);
}

export async function createComment(content: string): Promise<CommentResponse> {
	const accessToken = getAccessToken();
	if (!accessToken) {
		throw new Error('로그인이 필요합니다.');
	}

	const comment: TalkComment = {
		id: `talk-${Date.now()}`,
		userId: null,
		author: getAuthUserName(),
		authorAvatar: '/default-avatar.png',
		content,
		createdAt: new Date().toLocaleString('ko-KR', {
			year: '2-digit',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		})
	};

	commentsState.unshift(comment);
	return toCommentResponse(comment);
}

export async function deleteComment(id: string): Promise<void> {
	const accessToken = getAccessToken();
	if (!accessToken) {
		throw new Error('로그인이 필요합니다.');
	}

	const index = commentsState.findIndex((comment) => comment.id === id);
	if (index >= 0) {
		commentsState.splice(index, 1);
	}
}

export async function getTeamMembers(): Promise<TeamMessageItem[]> {
	return [];
}

export async function getTeamMessageDetail(_memberId: string): Promise<TeamMessageItem | null> {
	return null;
}

export async function getAdminCharacter(): Promise<{ id: number | null; name?: string }> {
	return { id: null };
}

export async function getNotices(): Promise<Record<string, unknown>> {
	return {};
}
