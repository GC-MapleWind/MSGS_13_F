import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

const DEFAULT_FRONTEND_PORT = 5173;

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, '.', '');
	const parsedFrontendPort = Number(env.FRONTEND_PORT);
	const frontendPort =
		Number.isInteger(parsedFrontendPort) && parsedFrontendPort > 0
			? parsedFrontendPort
			: DEFAULT_FRONTEND_PORT;

	return {
		server: {
			port: frontendPort,
			strictPort: true
		},
		plugins: [tailwindcss(), sveltekit()]
	};
});
