import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { User, AuthState } from '$lib/types'; // AuthState에 registerToken 추가됨
import * as api from '$lib/utils/api';

const STORAGE_KEY = 'auth_token';
const USER_STORAGE_KEY = 'auth_user';
const SAVED_NAME_KEY = 'saved_name';
const REGISTER_TOKEN_KEY = 'register_token'; // registerToken을 위한 새 키 추가

// 브라우저 환경에서만 localStorage 접근
function getStorageItem(key: string): string | null {
	if (!browser) return null;
	try {
		return localStorage.getItem(key);
	} catch (e) {
		console.error('Failed to access localStorage:', e);
		return null;
	}
}

function setStorageItem(key: string, value: string): void {
	if (!browser) return;
	try {
		localStorage.setItem(key, value);
	} catch (e) {
		console.error('Failed to set localStorage:', e);
	}
}

function removeStorageItem(key: string): void {
	if (!browser) return;
	try {
		localStorage.removeItem(key);
	} catch (e) {
		console.error('Failed to remove localStorage:', e);
	}
}

// 초기 상태 로드
function getInitialState(): AuthState {
	if (!browser) {
		return {
			isAuthenticated: false,
			user: null,
			isLoading: false,
			registerToken: null // registerToken 초기값 추가
		};
	}

	const token = getStorageItem(STORAGE_KEY);
	const userStr = getStorageItem(USER_STORAGE_KEY);
	let user: User | null = null;
	const registerToken = getStorageItem(REGISTER_TOKEN_KEY); // registerToken 로드

	if (userStr) {
		try {
			user = JSON.parse(userStr);
		} catch (e) {
			console.error('Failed to parse user from storage:', e);
		}
	}

	return {
		isAuthenticated: !!token && !!user,
		user,
		isLoading: false,
		registerToken // registerToken 상태에 포함
	};
}

// 스토어 생성
const { subscribe, set, update } = writable<AuthState>(getInitialState());

/**
 * 인증 데이터(토큰, 유저 정보, registerToken)를 스토어에 설정하고 localStorage에 저장
 */
function setAuthData(
	token: string | null,
	user: User | null,
	registerToken: string | null = null
): void {
	if (token) {
		setStorageItem(STORAGE_KEY, token);
	} else {
		removeStorageItem(STORAGE_KEY);
	}

	if (user) {
		setStorageItem(USER_STORAGE_KEY, JSON.stringify(user));
	} else {
		removeStorageItem(USER_STORAGE_KEY);
	}

	if (registerToken) {
		setStorageItem(REGISTER_TOKEN_KEY, registerToken);
	} else {
		removeStorageItem(REGISTER_TOKEN_KEY);
	}

	set({
		isAuthenticated: !!token && !!user,
		user,
		isLoading: false,
		registerToken
	});
}

/**
 * registerToken만 스토어에 설정 (회원가입 전용)
 */
export function setRegisterToken(token: string | null): void {
	if (token) {
		setStorageItem(REGISTER_TOKEN_KEY, token);
	} else {
		removeStorageItem(REGISTER_TOKEN_KEY);
	}
	update((state) => ({ ...state, registerToken: token, isLoading: false }));
}


/**
 * 저장된 이름 가져오기
 */
export function getSavedName(): string | null {
	return getStorageItem(SAVED_NAME_KEY);
}

/**
 * 이름 저장
 */
export function saveName(name: string): void {
	setStorageItem(SAVED_NAME_KEY, name);
}

/**
 * 로그인 (일반 이름/학번 로그인)
 */
export async function login(name: string, studentId: string, saveNameFlag = false): Promise<void> {
	update((state) => ({ ...state, isLoading: true }));

	try {
		const response = await api.login({
			name,
			studentId,
			saveName: saveNameFlag
		});

		if (!response.success || !response.data) {
			throw new Error(response.message || '로그인에 실패했습니다.');
		}

		const { token, user } = response.data;

		// 새로운 setAuthData 함수 사용
		setAuthData(token, user);

		// 이름 저장 옵션이 체크되어 있으면 저장
		if (saveNameFlag) {
			saveName(user.name);
		}
	} catch (error) {
		update((state) => ({ ...state, isLoading: false }));
		throw error;
	}
}

/**
 * 로그아웃
 */
export async function logout(): Promise<void> {
	try {
		await api.logout();
	} catch (error) {
		console.error('Logout API call failed:', error);
		// API 호출 실패해도 로컬 로그아웃은 진행
	}

	// 로컬 스토리지 정리
	removeStorageItem(STORAGE_KEY);
	removeStorageItem(USER_STORAGE_KEY);
	removeStorageItem(REGISTER_TOKEN_KEY); // registerToken도 제거

	// 상태 초기화
	set({
		isAuthenticated: false,
		user: null,
		isLoading: false,
		registerToken: null // registerToken 초기화
	});
}

/**
 * 인증 상태 확인
 */
export async function checkAuth(): Promise<void> {
	if (!browser) return;

	const token = getStorageItem(STORAGE_KEY);
	if (!token) {
		setAuthData(null, null, null); // 토큰 없으면 모든 인증 정보 초기화
		return;
	}

	// 디버그 토큰인 경우 백엔드 검증 건너뛰기 (디버그용)
	if (token === 'debug-token') {
		// 로컬 스토리지에서 유저 정보 가져오기
		const userStr = getStorageItem(USER_STORAGE_KEY);
		if (userStr) {
			try {
				const user = JSON.parse(userStr);
				setAuthData(token, user);
				return;
			} catch (e) {
				console.error('Failed to parse debug user:', e);
			}
		}
	}

	update((state) => ({ ...state, isLoading: true }));

	try {
		const response = await api.verifyAuth();

		if (!response.success || !response.data) {
			// 인증 실패 시 로그아웃 처리
			await logout();
			return;
		}

		const user = response.data.user;
		setAuthData(token, user); // 기존 토큰과 새로운 유저 정보로 인증 데이터 설정
	} catch (error) {
		console.error('Auth verification failed:', error);
		// 인증 실패 시 로그아웃 처리
		await logout();
	}
}

export const authStore = {
	subscribe,
	login,
	logout,
	checkAuth,
	getSavedName,
	saveName,
	setAuthData, // 새로 추가된 함수 export
	setRegisterToken // 새로 추가된 함수 export
};