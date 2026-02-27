export const CLIENT_ERROR_TOAST_EVENT = "app:client-error-toast";

export interface ClientErrorToastDetail {
	message: string;
	path?: string;
	timestamp?: string;
}
