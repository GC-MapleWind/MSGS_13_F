import { redirect } from '@sveltejs/kit';
import { authStore } from '$lib/stores/auth';
import { browser } from '$app/environment';
import { get } from 'svelte/store';

// handle 함수는 페이지 로드 전에 실행됩니다.
export async function handle({ event, resolve }) {
    if (!browser) {
        return resolve(event);
    }

    const { isAuthenticated, registerToken } = get(authStore);
    const currentPath = event.url.pathname;

    // 인증이 필요한 페이지 목록 (예시)
    const protectedRoutes = ['/protected', '/settings']; // TODO: 실제 보호해야 할 라우트 추가
    // 로그인 페이지는 인증된 사용자에게는 접근 불가
    const loginRoute = '/login';
    // 회원가입 페이지는 registerToken이 없는 사용자에게는 접근 불가
    const signupRoute = '/auth/signup';

    // 로그인되지 않은 사용자가 보호된 페이지에 접근 시 로그인 페이지로 리다이렉트
    if (!isAuthenticated && protectedRoutes.some(route => currentPath.startsWith(route))) {
        throw redirect(302, loginRoute);
    }

    // 로그인된 사용자가 로그인 페이지에 접근 시 메인 페이지로 리다이렉트
    if (isAuthenticated && currentPath.startsWith(loginRoute)) {
        throw redirect(302, '/');
    }

    // registerToken이 없는 사용자가 회원가입 페이지에 접근 시 로그인 페이지로 리다이렉트
    if (currentPath.startsWith(signupRoute) && !registerToken) {
        throw redirect(302, loginRoute);
    }
    // registerToken이 있는 사용자가 로그인 페이지에 접근 시 회원가입 페이지로 리다이렉트
    // 이 경우는 이미 auth/callback에서 signup으로 보내므로 필요 없을 수도 있지만, 직접 login으로 접근했을 경우를 대비
    if (registerToken && currentPath.startsWith(loginRoute)) {
        throw redirect(302, signupRoute);
    }


    const response = await resolve(event);
    return response;
}