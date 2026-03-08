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

const MEMBER_ID_BY_NAME: Record<string, number> = {
	강민: 1,
	강민아: 2,
	배승민: 40
};

function isAllowedMember(name: string): name is '강민' | '강민아' | '배승민' {
	return name === '강민' || name === '강민아' || name === '배승민';
}

function isValidStudentId(studentId: string): boolean {
	return /^\d{9}$/.test(studentId);
}

function readStoredUser(): VerifyResponse['user'] | null {
	if (typeof window === 'undefined') return null;
	try {
		const raw = localStorage.getItem('auth_user');
		if (!raw) return null;
		const parsed = JSON.parse(raw) as Partial<VerifyResponse['user']>;
		if (
			typeof parsed.id === 'number' &&
			typeof parsed.name === 'string' &&
			typeof parsed.studentId === 'string'
		) {
			return {
				id: parsed.id,
				name: parsed.name,
				studentId: parsed.studentId
			};
		}
		return null;
	} catch {
		return null;
	}
}

export async function login(request: LoginRequest): Promise<ApiResponse<LoginResponse>> {
	const name = request.name.trim();
	const studentId = request.studentId.trim();

	if (!isAllowedMember(name)) {
		return {
			success: false,
			message: '허용된 사용자만 로그인할 수 있습니다.',
			status: 403
		};
	}

	if (!isValidStudentId(studentId)) {
		return {
			success: false,
			message: '학번은 9자리 숫자여야 합니다.',
			status: 400
		};
	}

	return {
		success: true,
		data: {
			token: `static-token-${name}-${Date.now()}`,
			user: {
				id: MEMBER_ID_BY_NAME[name],
				name,
				studentId
			}
		},
		status: 200
	};
}

export async function kakaoLogin(
	_code: string
): Promise<ApiResponse<LoginResponse | KakaoLoginNeedSignupResponse>> {
	return {
		success: true,
		data: {
			registerToken: `static-register-${Date.now()}`
		},
		status: 202
	};
}

export async function logout(): Promise<ApiResponse<void>> {
	return {
		success: true,
		status: 200
	};
}

export async function verifyAuth(): Promise<ApiResponse<VerifyResponse>> {
	const user = readStoredUser();
	if (!user) {
		return {
			success: false,
			message: '인증 정보가 없습니다.',
			status: 401
		};
	}

	return {
		success: true,
		data: { user },
		status: 200
	};
}

export async function signup(request: SignupRequest): Promise<ApiResponse<SignupResponse>> {
	if (!request.registerToken.startsWith('static-register-')) {
		return {
			success: false,
			message: '유효하지 않은 가입 토큰입니다.',
			status: 400
		};
	}

	if (!isValidStudentId(request.studentId.trim())) {
		return {
			success: false,
			message: '학번은 9자리 숫자여야 합니다.',
			status: 400
		};
	}

	const nickname = request.nickname.trim();
	if (!nickname) {
		return {
			success: false,
			message: '닉네임이 필요합니다.',
			status: 400
		};
	}

	return {
		success: true,
		data: {
			token: `static-token-${nickname}-${Date.now()}`,
			user: {
				id: 999,
				name: nickname,
				studentId: request.studentId.trim(),
				nickname
			}
		},
		status: 201
	};
}
