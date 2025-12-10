import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@beggy/types': path.resolve(__dirname, '../../packages/types/src'),
			'@beggy/shared': path.resolve(
				__dirname,
				'../../packages/shared/src'
			),
		},
	},
});
