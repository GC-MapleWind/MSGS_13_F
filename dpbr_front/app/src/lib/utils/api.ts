const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	message?: string;
}

export interface LoginRequest {
	name: string;
	studentId: string;
	saveName?: boolean;
}

export interface LoginResponse {
	token: string;
	user: {
		name: string;
		studentId: string;
	};
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
		nickname: string; // 회원가입 시 닉네임도 포함될 수 있음
	};
}

/**
 * API 요청 헬퍼 함수
 */
async function apiRequest<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<ApiResponse<T>> {
	try {
		const token = localStorage.getItem('auth_token');
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
			...options.headers
		};

		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			...options,
			headers
		});

		const data = await response.json();

		if (!response.ok) {
			return {
				success: false,
				message: data.message || '요청에 실패했습니다.'
			};
		}

		return {
			success: true,
			data: data
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
	return apiRequest<LoginResponse>('/api/auth/login', {
		method: 'POST',
		body: JSON.stringify(request)
	});
}

/**
 * 로그아웃 API 호출
 */
export async function logout(): Promise<ApiResponse<void>> {
	return apiRequest<void>('/api/auth/logout', {
		method: 'POST'
	});
}

/**
 * 인증 확인 API 호출
 */
export async function verifyAuth(): Promise<ApiResponse<VerifyResponse>> {
	return apiRequest<VerifyResponse>('/api/auth/verify', {
		method: 'GET'
	});
}

/**
 * 회원가입 API 호출
 */
export async function signup(request: SignupRequest): Promise<ApiResponse<SignupResponse>> {
	return apiRequest<SignupResponse>('/api/auth/signup', { // 백엔드 회원가입 API 엔드포인트
		method: 'POST',
		body: JSON.stringify(request)
	});
}
