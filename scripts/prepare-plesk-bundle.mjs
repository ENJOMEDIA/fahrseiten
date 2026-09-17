import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const standalone = resolve(root, ".next/standalone");
const output = resolve(root, "dist/plesk");

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(standalone, output, { recursive: true });
await cp(resolve(root, ".next/static"), resolve(output, ".next/static"), {
  recursive: true,
});
await cp(resolve(root, "public"), resolve(output, "public"), {
  recursive: true,
});
await cp(resolve(root, "drizzle"), resolve(output, "drizzle"), {
  recursive: true,
});
await cp(resolve(root, "dist/sql"), resolve(output, "schema"), {
  recursive: true,
});

for (const file of [
  "app.mjs",
  "cron.mjs",
  "install.mjs",
  "migrate.mjs",
  "migration-runner.mjs",
  "password.mjs",
  "runtime-config.mjs",
  "validate-env.mjs",
]) {
  await cp(resolve(root, "deploy/plesk", file), resolve(output, file));
}

await cp(resolve(root, "docs/go-live-plesk.md"), resolve(output, "GO-LIVE.md"));
await cp(
  resolve(root, "docs/deployment-plesk.md"),
  resolve(output, "DEPLOYMENT.md"),
);
await cp(
  resolve(root, "deploy/plesk/ENVIRONMENT.example.txt"),
  resolve(output, "ENVIRONMENT.example.txt"),
);

const packageJson = JSON.parse(
  await readFile(resolve(root, "package.json"), "utf8"),
);
const bundlePackagePath = resolve(output, "package.json");
const bundlePackage = JSON.parse(await readFile(bundlePackagePath, "utf8"));
bundlePackage.scripts = {
  start: "node app.mjs",
  "install:platform": "node install.mjs",
  "db:migrate": "node migrate.mjs",
  cron: "node cron.mjs",
};
await writeFile(
  bundlePackagePath,
  `${JSON.stringify(bundlePackage, null, 2)}\n`,
);

await writeFile(
  resolve(output, "DEPLOYMENT.json"),
  `${JSON.stringify(
    {
      application: packageJson.name,
      version: packageJson.version,
      node: packageJson.engines.node,
      createdAt: new Date().toISOString(),
      sourceRevision: process.env.GITHUB_SHA ?? null,
      startupFile: "app.mjs",
    },
    null,
    2,
  )}\n`,
);

console.info(`Plesk-Artefakt erstellt: ${output}`);
