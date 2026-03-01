import { writable } from 'svelte/store';

export interface ToastMessage {
    id: number;
    message: string;
}

function createToastStore() {
    const { subscribe, update } = writable<ToastMessage[]>([]);

    let nextId = 0;

    return {
        subscribe,
        show: (message: string, duration = 3000) => {
            const id = nextId++;
            update((toasts) => [...toasts, { id, message }]);

            setTimeout(() => {
                update((toasts) => toasts.filter((t) => t.id !== id));
            }, duration);
        }
    };
}

export const toast = createToastStore();
