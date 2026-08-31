import { defineConfig } from 'vitest/config';

// Config separado do vite.config.ts (que define `base` só pro build
// do GitHub Pages, sem relação com teste) — CLAUDE.md seção 13:
// `npm test` cobre o motor de cálculo em `core/`, sem tocar UI/E2E
// por enquanto.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
