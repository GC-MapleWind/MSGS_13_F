import html2canvas from 'html2canvas';

/**
 * HTML 요소를 이미지로 캡쳐하고 다운로드합니다.
 *
 * @param element - 캡쳐할 HTML 요소
 * @param filename - 저장할 파일명 (확장자 포함)
 * @throws 캡쳐 또는 다운로드 실패 시 에러
 *
 * @example
 * ```typescript
 * const element = document.getElementById('capture-area');
 * await captureElementAsImage(element, 'my-image.png');
 * ```
 */
export async function captureElementAsImage(
	element: HTMLElement,
	filename: string
): Promise<void> {
	try {
		const canvas = await html2canvas(element, {
			scale: 2, // 고해상도 (Retina 디스플레이 대응)
			useCORS: true, // 외부 이미지 허용
			allowTaint: false, // 보안 설정
			backgroundColor: '#f5f5f5', // 배경색
			scrollY: -window.scrollY, // 스크롤 위치 보정
			scrollX: -window.scrollX,
			windowWidth: element.scrollWidth,
			windowHeight: element.scrollHeight
		});

		// Canvas를 Blob으로 변환 후 다운로드
		return new Promise((resolve, reject) => {
			canvas.toBlob((blob) => {
				if (!blob) {
					reject(new Error('Failed to create image blob'));
					return;
				}

				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = filename;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
				resolve();
			}, 'image/png');
		});
	} catch (error) {
		console.error('Image capture failed:', error);
		throw error;
	}
}

/**
 * 파일명 생성 헬퍼 함수
 *
 * @param baseName - 기본 파일명
 * @returns 타임스탬프가 포함된 파일명
 *
 * @example
 * ```typescript
 * generateFilename('character-담뫄') // 'character-담뫄-1234567890.png'
 * ```
 */
export function generateFilename(baseName: string): string {
	const timestamp = Date.now();
	const sanitized = baseName.replace(/[^a-zA-Z0-9가-힣-_]/g, '-');
	return `${sanitized}-${timestamp}.png`;
}
