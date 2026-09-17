import { access } from "node:fs/promises";

const applicationEntry = new URL("./dist/plesk/app.mjs", import.meta.url);

try {
  await access(applicationEntry);
} catch {
  console.error(
    "Der Plesk-Build fehlt. Im Plesk-Node.js-Toolkit zuerst das Skript deploy:plesk ausführen.",
  );
  process.exit(1);
}

await import(applicationEntry.href);
