const requiredPackages = ["next", "tsx", "sharp", "drizzle-orm", "mysql2"];

const missing = [];
for (const packageName of requiredPackages) {
  try {
    await import.meta.resolve(packageName);
  } catch {
    missing.push(packageName);
  }
}

if (missing.length) {
  console.error(
    [
      "Plesk-Abhängigkeiten fehlen.",
      `Nicht gefunden: ${missing.join(", ")}`,
      "Bitte in Plesk zuerst „Pakete installieren“ mit dem ausgewählten Paketmanager pnpm ausführen und danach deploy:plesk erneut starten.",
    ].join("\n"),
  );
  process.exit(1);
}

console.log("Plesk-Abhängigkeiten sind vollständig installiert.");
