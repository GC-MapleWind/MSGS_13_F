import type { Handle, HandleClientError } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    return resolve(event);
};

// 에러 핸들링 훅 추가
export const handleError: HandleClientError = ({ error, event }) => {
    console.error('Client-side error:', error, event);
    // TODO: 사용자에게 에러 메시지 표시 (Toast 등)
    // Sentry, Datadog 등 에러 모니터링 서비스에 에러 전송
};
