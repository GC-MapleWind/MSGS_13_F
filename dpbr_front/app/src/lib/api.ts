import { env } from '$env/dynamic/public';
import type { Character, SettlementItem, TalkComment } from './types';

/**
 * API 기본 URL (환경 변수 없으면 기본값 사용, CI/빌드 시에도 오류 없음)
 */
function getApiBaseUrl(): string {
	return env.PUBLIC_API_URL ?? 'http://localhost:8000';
}

/**
 * API 응답 타입
 */
interface CharacterResponse {
	id: number;
	name: string;
	detail_txt: string | null;
	level: number;
	job: string;
	server: string;
	avatar_url: string | null;
}

interface SettlementResponse {
	id: number;
	character_id: number;
	title: string;
	description: string | null;
	img_url: string | null;
	acquired_at: string;
}

interface CommentResponse {
	id: number;
	user_id: number | null;
	author: string;
	content: string;
	created_at: string;
}

/**
 * API 호출 유틸리티
 */
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
	const url = `${getApiBaseUrl()}${endpoint}`;
	
	try {
		const response = await fetch(url, {
			...options,
			headers: {
				'Content-Type': 'application/json',
				...options?.headers
			}
		});

		if (!response.ok) {
			throw new Error(`API Error: ${response.status} ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error('API Call Error:', error);
		throw error;
	}
}

/**
 * 캐릭터 목록 조회
 */
export async function getCharacters(): Promise<Character[]> {
	const data = await apiCall<CharacterResponse[]>('/api/v1/characters');
	
	return data.map((char) => ({
		id: char.id.toString(),
		name: char.name,
		nickname: char.detail_txt || char.name,
		avatarUrl: char.avatar_url || '/default-avatar.png',
		level: char.level,
		job: char.job,
		club: '단풍바람',
		server: char.server
	}));
}

/**
 * 특정 캐릭터 상세 정보 조회
 */
export async function getCharacterById(id: string): Promise<Character | null> {
	try {
		const data = await apiCall<CharacterResponse>(`/api/v1/characters/${id}`);
		
		return {
			id: data.id.toString(),
			name: data.name,
			nickname: data.detail_txt || data.name,
			avatarUrl: data.avatar_url || '/default-avatar.png',
			level: data.level,
			job: data.job,
			club: '단풍바람',
			server: data.server
		};
	} catch (error) {
		console.error('Failed to fetch character:', error);
		return null;
	}
}

/**
 * 특정 캐릭터의 메생결산 목록 조회
 */
export async function getSettlementsByCharacterId(characterId: string): Promise<SettlementItem[]> {
	const data = await apiCall<SettlementResponse[]>(
		`/api/v1/characters/${characterId}/settlements`
	);
	
	return data.map((settlement) => ({
		id: settlement.id.toString(),
		characterId: settlement.character_id.toString(),
		title: settlement.title,
		description: settlement.description || '',
		imageUrl: settlement.img_url || '/default-avatar.png',
		acquiredAt: settlement.acquired_at
	}));
}

/**
 * 특정 메생결산 상세 정보 조회
 */
export async function getSettlementById(id: string): Promise<SettlementItem | null> {
	try {
		const data = await apiCall<SettlementResponse>(`/api/v1/settlements/${id}`);
		
		return {
			id: data.id.toString(),
			characterId: data.character_id.toString(),
			title: data.title,
			description: data.description || '',
			imageUrl: data.img_url || '/default-avatar.png',
			acquiredAt: data.acquired_at
		};
	} catch (error) {
		console.error('Failed to fetch settlement:', error);
		return null;
	}
}

/**
 * 댓글 목록 조회
 */
export async function getComments(page: number = 1, limit: number = 20): Promise<TalkComment[]> {
	const data = await apiCall<CommentResponse[]>(
		`/api/v1/comments?page=${page}&limit=${limit}`
	);
	
	return data.map((comment) => ({
		id: comment.id.toString(),
		author: comment.author,
		authorAvatar: '/default-avatar.png',
		content: comment.content,
		createdAt: new Date(comment.created_at).toLocaleString('ko-KR', {
			year: '2-digit',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		})
	}));
}

/**
 * 댓글 작성
 */
export async function createComment(content: string, accessToken: string): Promise<CommentResponse> {
	return await apiCall<CommentResponse>('/api/v1/comments', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`
		},
		body: JSON.stringify({ content })
	});
}

/**
 * 시스템 공지사항 조회
 */
export async function getNotices(): Promise<Record<string, any>> {
	return await apiCall<Record<string, any>>('/api/v1/system/notices');
}
