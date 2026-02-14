/**
 * 이미지 URL 유틸리티
 */

const DEFAULT_AVATAR = '/default-avatar.png';

/**
 * 이미지 URL이 유효하지 않을 때 기본 이미지를 반환
 */
export function getImageUrl(url: string | null | undefined): string {
	if (!url || url.trim() === '') {
		return DEFAULT_AVATAR;
	}
	return url;
}

/**
 * 이미지 로드 에러 시 기본 이미지로 대체
 */
export function handleImageError(event: Event) {
	const img = event.target as HTMLImageElement;
	if (img.src !== DEFAULT_AVATAR) {
		img.src = DEFAULT_AVATAR;
	}
}
