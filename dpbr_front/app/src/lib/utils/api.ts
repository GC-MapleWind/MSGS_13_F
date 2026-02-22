import { env } from '$env/dynamic/public';

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

const API_REQUEST_TIMEOUT_MS = 15000;

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
		id: number;
		name: string;
		studentId: string;
	};
}

export interface KakaoLoginNeedSignupResponse {
	registerToken: string;
}

export interface VerifyResponse {
	user: {
		id: number;
		name: string;
		studentId: string;
	};
}

interface VerifyBackendResponse {
	id: number;
	username: string;
	name: string;
	student_id?: string | null;
}

export interface SignupRequest {
	registerToken: string;
	studentId: string;
	nickname: string;
}

export interface SignupResponse {
	token: string;
	user: {
		id: number;
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
		const decoded = JSON.parse(json) as Record<string, unknown>;

		if (typeof decoded.exp === 'number' && decoded.exp * 1000 < Date.now()) {
			return null;
		}

		return decoded;
	} catch {
		return null;
	}
}

function toUserFromToken(
	token: string,
	fallbackName: string,
	fallbackStudentId: string
): { id: number; name: string; studentId: string } {
	const payload = decodeJwtPayload(token);
	if (!payload) {
		return { id: 0, name: fallbackName, studentId: fallbackStudentId };
	}

	const id =
		(typeof payload.id === 'number' && payload.id) ||
		(typeof payload.sub === 'string' && parseInt(payload.sub, 10)) ||
		0;
	const name =
		(typeof payload.name === 'string' && payload.name) ||
		(typeof payload.nickname === 'string' && payload.nickname) ||
		(typeof payload.username === 'string' && payload.username) ||
		fallbackName;
	const studentId =
		(typeof payload.student_id === 'string' && payload.student_id) ||
		(typeof payload.studentId === 'string' && payload.studentId) ||
		fallbackStudentId;

	return { id, name, studentId };
}

/**
 * API 요청 헬퍼 함수
 */
async function apiRequest<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<ApiResponse<T>> {
	const timeoutController = new AbortController();
	const timeoutId = setTimeout(() => timeoutController.abort(), API_REQUEST_TIMEOUT_MS);

	if (options.signal) {
		if (options.signal.aborted) {
			timeoutController.abort();
		} else {
			options.signal.addEventListener('abort', () => timeoutController.abort(), { once: true });
		}
	}

	try {
		const token = getAuthTokenFromStorage();
		const headers = new Headers(options.headers);
		if (!headers.has('Content-Type')) {
			headers.set('Content-Type', 'application/json');
		}

		if (token) {
			headers.set('Authorization', `Bearer ${token}`);
		}

		const response = await fetch(buildApiUrl(endpoint), {
			...options,
			headers,
			signal: timeoutController.signal
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
		if (error instanceof DOMException && error.name === 'AbortError') {
			return {
				success: false,
				message: '요청 시간이 초과되었습니다. 네트워크 상태를 확인 후 다시 시도해 주세요.'
			};
		}

		return {
			success: false,
			message: error instanceof Error ? error.message : '네트워크 오류가 발생했습니다.'
		};
	} finally {
		clearTimeout(timeoutId);
	}
}

/**
 * 로그인 API 호출
 */
export async function login(request: LoginRequest): Promise<ApiResponse<LoginResponse>> {
	const form = new URLSearchParams();
	// 백엔드 스펙: username/password (x-www-form-urlencoded)
	// 여기서는 username을 학번, password를 학번으로 매핑합니다.
	form.set('username', request.studentId);
	form.set('password', request.studentId);

	const response = await apiRequest<TokenBackendResponse>('/users/login', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: form.toString()
	});

	if (!response.success || !response.data) {
		return {
			success: false,
			message: response.message || '로그인에 실패했습니다.',
			status: response.status
		};
	}

	const user = toUserFromToken(response.data.access_token, request.name, request.studentId);

	return {
		success: true,
		data: {
			token: response.data.access_token,
			user
		},
		status: response.status
	};
}

/**
 * 카카오 로그인 API 호출
 */
export async function kakaoLogin(code: string): Promise<ApiResponse<LoginResponse | KakaoLoginNeedSignupResponse>> {
	const query = new URLSearchParams({ code }).toString();
	const response = await apiRequest<KakaoLoginBackendResponse>(`/users/auth/kakao/login?${query}`, {
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
	return apiRequest<void>('/users/logout', {
		method: 'POST'
	});
}

/**
 * 인증 확인 API 호출
 */
export async function verifyAuth(): Promise<ApiResponse<VerifyResponse>> {
	const response = await apiRequest<VerifyBackendResponse>('/users/me', {
		method: 'GET'
	});

	if (!response.success || !response.data) {
		return {
			success: false,
			message: response.message || '인증 확인에 실패했습니다.',
			status: response.status
		};
	}

	return {
		success: true,
		data: {
			user: {
				id: response.data.id || 0,
				name: response.data.name,
				studentId: response.data.student_id || response.data.username
			}
		},
		status: response.status
	};
}

/**
 * 회원가입 API 호출
 */
export async function signup(request: SignupRequest): Promise<ApiResponse<SignupResponse>> {
	const response = await apiRequest<TokenBackendResponse>('/users/auth/kakao/register', {
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
				...toUserFromToken(response.data.access_token, request.nickname, request.studentId),
				nickname: request.nickname
			}
		},
		status: response.status
	};
}
