import type { BuildConfig } from "bun";
import dts from 'bun-plugin-dts'


const defaultBuildConfig: BuildConfig = {
  entrypoints: ["./src/index.tsx"],
  outdir: "./dist",
};

await Promise.all([
  Bun.build({
    ...defaultBuildConfig,
    format: "esm",
    naming: "[dir]/[name].js",
    external: ["react", "react-dom"],
    target: 'browser',
    plugins: [
      dts()
    ],

  }),
]);
