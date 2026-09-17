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

for (const file of ["app.mjs", "cron.mjs", "migrate.mjs", "validate-env.mjs"]) {
  await cp(resolve(root, "deploy/plesk", file), resolve(output, file));
}

const packageJson = JSON.parse(
  await readFile(resolve(root, "package.json"), "utf8"),
);
await writeFile(
  resolve(output, "DEPLOYMENT.json"),
  `${JSON.stringify(
    {
      application: packageJson.name,
      version: packageJson.version,
      node: packageJson.engines.node,
      createdAt: new Date().toISOString(),
      startupFile: "app.mjs",
    },
    null,
    2,
  )}\n`,
);

console.info(`Plesk-Artefakt erstellt: ${output}`);
