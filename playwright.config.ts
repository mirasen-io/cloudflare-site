/// <reference types="node" />
import { defineConfig } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
	use: { baseURL: baseURL ?? 'http://localhost:4173' },
	webServer: baseURL ? undefined : { command: 'npm run build && npm run preview', port: 4173 },
	testMatch: '**/*.e2e.{ts,js}'
});
