import { env } from '$env/dynamic/public';
import type { Character, SettlementItem, TalkComment, TeamMessageItem } from './types';

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

function normalizeAssetUrl(url: string | null | undefined): string {
	if (!url) return '/default-avatar.png';
	if (/^https?:\/\//i.test(url)) return url;
	if (url.startsWith('/')) return `${getApiBaseUrl()}${url}`;
	return `${getApiBaseUrl()}/${url}`;
}

function normalizeApiErrorDetail(detail: unknown): string {
	if (typeof detail !== 'string') return '';

	const collapsed = detail.replace(/\s+/g, ' ').trim();
	if (!collapsed) return '';

	return collapsed.slice(0, 200);
}

function parseApiDateTime(raw: string): Date {
	const normalized = raw.includes(' ') ? raw.replace(' ', 'T') : raw;
	const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized);
	return new Date(hasTimezone ? normalized : `${normalized}Z`);
}

export function formatCommentDateTime(raw: string): string {
	const parsed = parseApiDateTime(raw);
	if (Number.isNaN(parsed.getTime())) {
		return raw;
	}

	return parsed.toLocaleString('ko-KR', {
		timeZone: 'Asia/Seoul',
		year: '2-digit',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	});
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

interface CharactersPaginationResponse {
	items: CharacterResponse[];
	total: number;
	page: number;
	limit: number;
}

interface SettlementsPaginationResponse {
	items: SettlementResponse[];
	total: number;
	page: number;
	limit: number;
}

interface CommentResponse {
	id: number;
	user_id: number | null;
	author: string;
	content: string;
	created_at: string;
}

interface TeamMemberResponse {
	id: number;
	name: string;
	role: string;
	profile_img_url: string | null;
	message: {
		title: string;
		content: string;
	} | null;
}

interface TeamMemberDetailResponse extends TeamMemberResponse {
	message: {
		id: number;
		title: string;
		content: string;
		detail_img_url: string | null;
	} | null;
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

		const responseContentType = response.headers.get('content-type') ?? '';
		if (!responseContentType.includes('application/json')) {
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

	return data.map(mapCharacterResponse);
}

export async function getCharactersPaginated(
	page: number = 1,
	limit: number = 10
): Promise<{ items: Character[]; total: number; page: number; limit: number }> {
	const data = await apiCall<CharactersPaginationResponse>(
		`/characters/pagination?page=${page}&limit=${limit}`
	);

	return {
		items: data.items.map(mapCharacterResponse),
		total: data.total,
		page: data.page,
		limit: data.limit
	};
}

function mapCharacterResponse(char: CharacterResponse): Character {
	return {
		id: char.id.toString(),
		name: char.name,
		nickname: char.detail_txt || char.name,
		avatarUrl: normalizeAssetUrl(char.avatar_url),
		level: char.level,
		job: char.job,
		club: '단풍바람',
		server: char.server
	};
}

function mapSettlementResponse(settlement: SettlementResponse): SettlementItem {
	return {
		id: settlement.id.toString(),
		characterId: settlement.character_id.toString(),
		title: settlement.title,
		description: settlement.description || '',
		imageUrl: settlement.img_url ? `${getApiBaseUrl()}${settlement.img_url}` : '/default-avatar.png',
		acquiredAt: settlement.acquired_at
	};
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
			avatarUrl: normalizeAssetUrl(data.avatar_url),
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

	return data.map(mapSettlementResponse);
}

export async function getSettlementsByCharacterIdPaginated(
	characterId: string,
	page: number = 1,
	limit: number = 10
): Promise<{ items: SettlementItem[]; total: number; page: number; limit: number }> {
	const data = await apiCall<SettlementsPaginationResponse>(
		`/characters/${characterId}/settlements/pagination?page=${page}&limit=${limit}`
	);

	return {
		items: data.items.map(mapSettlementResponse),
		total: data.total,
		page: data.page,
		limit: data.limit
	};
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
			imageUrl: data.img_url ? `${getApiBaseUrl()}${data.img_url}` : '/default-avatar.png',
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
		`/comments?page=${page}&limit=${limit}`
	);

	return data.map((comment) => ({
		id: comment.id.toString(),
		userId: comment.user_id,
		author: comment.author,
		authorAvatar: '/default-avatar.png',
		content: comment.content,
		createdAt: formatCommentDateTime(comment.created_at)
	}));
}

/**
 * 댓글 작성
 */
export async function createComment(content: string): Promise<CommentResponse> {
	const accessToken = getAccessToken();
	if (!accessToken) {
		throw new Error('로그인이 필요합니다.');
	}

	return await apiCall<CommentResponse>('/comments', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`
		},
		body: JSON.stringify({ content })
	});
}

/**
 * 댓글 삭제 (스켈레톤 함수 - 프론트엔드 작업용)
 */
export async function deleteComment(id: string): Promise<void> {
	const accessToken = getAccessToken();
	if (!accessToken) {
		throw new Error('로그인이 필요합니다.');
	}

	await apiCall(`/comments/${id}`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});
}

export async function getTeamMembers(): Promise<TeamMessageItem[]> {
	const data = await apiCall<TeamMemberResponse[]>('/system/team');

	return data.map((member) => ({
		id: member.id.toString(),
		name: member.name,
		role: member.role,
		title: member.message?.title || '',
		content: member.message?.content || '',
		imageUrl: normalizeAssetUrl(member.profile_img_url)
	}));
}

export async function getTeamMessageDetail(memberId: string): Promise<TeamMessageItem | null> {
	try {
		const data = await apiCall<TeamMemberDetailResponse>(`/system/team/${memberId}`);

		return {
			id: data.id.toString(),
			name: data.name,
			role: data.role,
			title: data.message?.title || '',
			content: data.message?.content || '',
			imageUrl: normalizeAssetUrl(data.message?.detail_img_url || data.profile_img_url)
		};
	} catch (error) {
		console.error('Failed to fetch team message detail:', error);
		return null;
	}
}

/**
 * 사이드바용: 운영팀 캐릭터 ID 조회
 */
export async function getAdminCharacter(): Promise<{ id: number | null; name?: string }> {
	try {
		return await apiCall<{ id: number | null; name?: string }>('/system/admin-character');
	} catch (error) {
		console.error('Failed to fetch admin character:', error);
		return { id: null };
	}
}

/**
 * 시스템 공지사항 조회
 */
export async function getNotices(): Promise<Record<string, any>> {
	return await apiCall<Record<string, any>>('/system/notices');
}
