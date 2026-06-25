import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  // This banner makes the built file directly runnable as a command-line program.
  banner: { js: "#!/usr/bin/env node" },
  clean: true,
});
