import { defineConfig } from 'vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			$lib: path.resolve(__dirname, './src/lib')
		}
	},
	build: {
		minify: false,
		copyPublicDir: false,
		emptyOutDir: false,
		// outDir: path.resolve(__dirname, '../../dist'),
		rollupOptions: {
			input: {
				worker: path.resolve(__dirname, './worker.ts'),
			},
			output: {
				// exports: 'none',
				entryFileNames: `[name].js`,
				chunkFileNames: `[name].js`,
				assetFileNames: `[name].[ext]`,
				// This function will put everything into a single 'everything.js' file
				// You can customize the logic here to combine specific files
				manualChunks: (id) => {
					if (id.includes('worker')) return 'worker';
				},
			}
		},
	},
});
