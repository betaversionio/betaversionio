import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/hooks.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: ['react', '@tanstack/react-query'],
});
