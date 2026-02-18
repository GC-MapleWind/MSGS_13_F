import { env } from '$env/dynamic/public';
import type { Character, SettlementItem, TalkComment } from './types';

/**
 * API 기본 URL
 * - 반드시 PUBLIC_API_URL 환경변수로 주입되도록 강제
 */
function getApiBaseUrl(): string {
	const rawValue = env.PUBLIC_API_URL?.trim();
	if (!rawValue) {
		throw new Error('PUBLIC_API_URL is not set');
	}

	return rawValue.replace(/\/+$/, '');
}

function getApiPrefix(): string {
	const rawValue = (env.PUBLIC_API_PREFIX || '/api/v1').trim();
	const prefixed = rawValue.startsWith('/') ? rawValue : `/${rawValue}`;
	const normalized = prefixed.replace(/\/+$/, '');

	if (!normalized || normalized === '/') {
		throw new Error('PUBLIC_API_PREFIX must include at least one path segment');
	}

	return normalized;
}

function buildApiUrl(endpoint: string): string {
	const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
	return `${getApiBaseUrl()}${getApiPrefix()}${normalizedEndpoint}`;
}

function normalizeApiErrorDetail(detail: unknown): string {
	if (typeof detail !== 'string') return '';

	const collapsed = detail.replace(/\s+/g, ' ').trim();
	if (!collapsed) return '';

	return collapsed.slice(0, 200);
}

function isExpiredJwt(token: string): boolean {
	try {
		const payload = token.split('.')[1];
		if (!payload) return false;
		const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
		const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
		const json = atob(padded);
		const decoded = JSON.parse(json) as { exp?: number };

		return typeof decoded.exp === 'number' && decoded.exp * 1000 < Date.now();
	} catch {
		return false;
	}
}

function getAccessToken(): string | null {
	if (typeof window === 'undefined') return null;
	try {
		const token = localStorage.getItem('auth_token');
		if (!token) return null;

		if (isExpiredJwt(token)) {
			localStorage.removeItem('auth_token');
			return null;
		}

		return token;
	} catch {
		return null;
	}
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
	is_mine?: boolean;
}

/**
 * API 호출 유틸리티
 */
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
	const url = buildApiUrl(endpoint);
	
	try {
		const response = await fetch(url, {
			...options,
			headers: {
				'Content-Type': 'application/json',
				...options?.headers
			}
		});

		if (!response.ok) {
			let detail = '';
			const contentType = response.headers.get('content-type') ?? '';
			const exposeDetail = response.status >= 400 && response.status < 500;

			try {
				if (contentType.includes('application/json')) {
					const errorData = await response.json();
					detail = normalizeApiErrorDetail(errorData?.detail ?? errorData?.message);
				}
			} catch (error) {
				if (import.meta.env.DEV) {
					console.warn('Failed to parse API error detail:', error);
				}
			}

			throw new Error(
				exposeDetail && detail
					? `API Error: ${response.status} ${detail}`
					: `API Error: ${response.status} ${response.statusText}`
			);
		}

		if (response.status === 204) {
			return undefined as T;
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
	const data = await apiCall<CharacterResponse[]>('/characters');
	
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
		const data = await apiCall<CharacterResponse>(`/characters/${id}`);
		
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
		`/characters/${characterId}/settlements`
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
		const data = await apiCall<SettlementResponse>(`/settlements/${id}`);
		
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
	const accessToken = getAccessToken();
	const data = await apiCall<CommentResponse[]>(`/comments?page=${page}&limit=${limit}`, {
		headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined
	});
	
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
		}),
		userId: comment.user_id,
		isMine: comment.is_mine ?? false
	}));
}

/**
 * 댓글 작성
 */
export async function createComment(content: string, nickname?: string): Promise<CommentResponse> {
	const accessToken = getAccessToken();

	return await apiCall<CommentResponse>('/comments', {
		method: 'POST',
		headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
		body: JSON.stringify({
			content,
			nickname: accessToken ? undefined : nickname
		})
	});
}

export async function deleteComment(commentId: string): Promise<void> {
	const accessToken = getAccessToken();
	if (!accessToken) {
		throw new Error('로그인이 필요합니다.');
	}

	await apiCall<void>(`/comments/${commentId}`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});
}

/**
 * 시스템 공지사항 조회
 */
export async function getNotices(): Promise<Record<string, any>> {
	return await apiCall<Record<string, any>>('/system/notices');
}
