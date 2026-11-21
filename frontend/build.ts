// Builds the card bundle into the integration, so the integration can serve it.
import pkg from "./package.json";
import manifest from "../custom_components/camera_hub/manifest.json";

if (pkg.version !== manifest.version) {
  console.error(
    `Version mismatch: frontend/package.json is ${pkg.version}, manifest.json is ${manifest.version}`,
  );
  process.exit(1);
}

const result = await Bun.build({
  entrypoints: ["src/card.ts"],
  outdir: "../custom_components/camera_hub/frontend",
  naming: "camera-hub-card.js",
  target: "browser",
  format: "esm",
  minify: true,
  define: { __CARD_VERSION__: JSON.stringify(pkg.version) },
});

if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}
console.log(`Built camera-hub-card.js ${pkg.version}`);
