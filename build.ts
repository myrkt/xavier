import type { BuildConfig } from "bun";

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
  }),
]);
