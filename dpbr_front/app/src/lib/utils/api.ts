import { env } from '$env/dynamic/public';

const API_BASE_URL = env.PUBLIC_API_URL || 'http://localhost:8001';

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	message?: string;
	status?: number;
}

export interface LoginRequest {
	name: string;
	studentId: string;
	saveName?: boolean;
}

export interface KakaoLoginRequest {
	code: string;
}

export interface LoginResponse {
	token: string;
	user: {
		name: string;
		studentId: string;
	};
}

export interface KakaoLoginNeedSignupResponse {
	registerToken: string;
}

export interface VerifyResponse {
	user: {
		name: string;
		studentId: string;
	};
}

export interface SignupRequest {
	registerToken: string;
	studentId: string;
	nickname: string;
}

export interface SignupResponse {
	token: string;
	user: {
		name: string;
		studentId: string;
		nickname: string;
	};
}

interface KakaoLoginBackendResponse {
	is_new_user: boolean;
	register_token?: string | null;
	access_token?: string | null;
	token_type?: string | null;
}

interface TokenBackendResponse {
	access_token: string;
	token_type: string;
}

function getAuthTokenFromStorage(): string | null {
	if (typeof window === 'undefined') return null;
	try {
		return localStorage.getItem('auth_token');
	} catch {
		return null;
	}
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
	try {
		const payload = token.split('.')[1];
		if (!payload) return null;
		const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
		const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
		const json = atob(padded);
		return JSON.parse(json) as Record<string, unknown>;
	} catch {
		return null;
	}
}

function toUserFromToken(
	token: string,
	fallbackName: string,
	fallbackStudentId: string
): { name: string; studentId: string } {
	const payload = decodeJwtPayload(token);
	if (!payload) {
		return { name: fallbackName, studentId: fallbackStudentId };
	}

	const name =
		(typeof payload.name === 'string' && payload.name) ||
		(typeof payload.nickname === 'string' && payload.nickname) ||
		(typeof payload.username === 'string' && payload.username) ||
		fallbackName;
	const studentId =
		(typeof payload.student_id === 'string' && payload.student_id) ||
		(typeof payload.studentId === 'string' && payload.studentId) ||
		fallbackStudentId;

	return { name, studentId };
}

/**
 * API 요청 헬퍼 함수
 */
async function apiRequest<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<ApiResponse<T>> {
	try {
		const token = getAuthTokenFromStorage();
		const headers = new Headers(options.headers);
		if (!headers.has('Content-Type')) {
			headers.set('Content-Type', 'application/json');
		}

		if (token) {
			headers.set('Authorization', `Bearer ${token}`);
		}

		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			...options,
			credentials: options.credentials ?? 'include',
			headers
		});
		const text = await response.text();
		const data = text ? JSON.parse(text) : null;

		if (!response.ok) {
			return {
				success: false,
				message: data?.message || data?.detail || '요청에 실패했습니다.',
				status: response.status
			};
		}

		return {
			success: true,
			data: data,
			status: response.status
		};
	} catch (error) {
		console.error('API request failed:', error);
		return {
			success: false,
			message: error instanceof Error ? error.message : '네트워크 오류가 발생했습니다.'
		};
	}
}

/**
 * 로그인 API 호출
 */
export async function login(request: LoginRequest): Promise<ApiResponse<LoginResponse>> {
	return apiRequest<LoginResponse>('/api/v1/users/login', {
		method: 'POST',
		body: JSON.stringify(request)
	});
}

/**
 * 카카오 로그인 API 호출
 */
export async function kakaoLogin(code: string): Promise<ApiResponse<LoginResponse | KakaoLoginNeedSignupResponse>> {
	const query = new URLSearchParams({ code }).toString();
	const response = await apiRequest<KakaoLoginBackendResponse>(`/api/v1/users/auth/kakao/login?${query}`, {
		method: 'POST'
	});

	if (!response.success || !response.data) {
		return {
			success: false,
			message: response.message || '카카오 로그인에 실패했습니다.',
			status: response.status
		};
	}

	if (response.data.is_new_user && response.data.register_token) {
		return {
			success: true,
			data: { registerToken: response.data.register_token },
			status: response.status
		};
	}

	if (!response.data.is_new_user && response.data.access_token) {
		return {
			success: true,
			data: {
				token: response.data.access_token,
				user: toUserFromToken(response.data.access_token, '카카오 사용자', '')
			},
			status: response.status
		};
	}

	return {
		success: false,
		message: '카카오 로그인 응답 형식이 올바르지 않습니다.',
		status: response.status
	};
}

/**
 * 로그아웃 API 호출
 */
export async function logout(): Promise<ApiResponse<void>> {
	return apiRequest<void>('/api/v1/users/logout', {
		method: 'POST'
	});
}

/**
 * 인증 확인 API 호출
 */
export async function verifyAuth(): Promise<ApiResponse<VerifyResponse>> {
	const token = getAuthTokenFromStorage();
	if (!token) {
		return { success: false, message: '인증 토큰이 없습니다.' };
	}

	const user = toUserFromToken(token, '사용자', '');
	return {
		success: true,
		data: { user },
		status: 200
	};
}

/**
 * 회원가입 API 호출
 */
export async function signup(request: SignupRequest): Promise<ApiResponse<SignupResponse>> {
	const response = await apiRequest<TokenBackendResponse>('/api/v1/users/auth/kakao/register', {
		method: 'POST',
		body: JSON.stringify({
			register_token: request.registerToken,
			student_id: request.studentId,
			nickname: request.nickname
		})
	});

	if (!response.success || !response.data) {
		return {
			success: false,
			message: response.message || '회원가입에 실패했습니다.',
			status: response.status
		};
	}

	return {
		success: true,
		data: {
			token: response.data.access_token,
			user: {
				name: request.nickname,
				studentId: request.studentId,
				nickname: request.nickname
			}
		},
		status: response.status
	};
}
