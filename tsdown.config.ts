import { defineConfig } from 'tsdown'

/** Workspace build for the host packages; ui-voice overrides via its package-local config. */
export default defineConfig({
  workspace: ['packages/*'],
  entry: ['lib/types/{index,invariant}.js'],
  outDir: 'lib',
  format: ['esm'],
  platform: 'node',
  target: 'es2024',
  fixedExtension: false,
  dts: false,
  clean: false,
})
