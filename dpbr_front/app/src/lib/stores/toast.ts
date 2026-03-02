import { writable } from 'svelte/store';

export interface ToastMessage {
    id: number;
    message: string;
    type?: 'default' | 'center';
}

function createToastStore() {
    const { subscribe, update } = writable<ToastMessage[]>([]);

    let nextId = 0;

    return {
        subscribe,
        show: (message: string, duration = 3000, type: 'default' | 'center' = 'default') => {
            const id = nextId++;
            update((toasts) => [...toasts, { id, message, type }]);

            setTimeout(() => {
                update((toasts) => toasts.filter((t) => t.id !== id));
            }, duration);
        }
    };
}

export const toast = createToastStore();
