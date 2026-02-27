import type { Handle, HandleClientError } from '@sveltejs/kit';
import {
    CLIENT_ERROR_TOAST_EVENT,
    type ClientErrorToastDetail
} from '$lib/events/client-error';

export const handle: Handle = async ({ event, resolve }) => {
    return resolve(event);
};

// 에러 핸들링 훅 추가
export const handleError: HandleClientError = ({ error, event }) => {
    console.error('Client-side error:', error, event);

    const detail: ClientErrorToastDetail = {
        message: '예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
        path: event.url.pathname,
        timestamp: new Date().toISOString()
    };

    window.dispatchEvent(
        new CustomEvent<ClientErrorToastDetail>(CLIENT_ERROR_TOAST_EVENT, { detail })
    );

    // Sentry, Datadog 등 에러 모니터링 서비스에 에러 전송
};
